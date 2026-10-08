import { createServiceClient } from "@/lib/supabase/service";
import type { CategorySlug } from "@/data/categories";
import type { AnatomyModel, Product, ProductPage, RobotFit } from "@/data/products";
import { isStockCondition } from "@/data/conditions";

/**
 * Supabase-backed product store — the single read/write path for product
 * data (see supabase/products-schema.sql for the table). Every caller keeps
 * the same async interface regardless of what's behind it, so this is the
 * only module that knows about the database.
 *
 * Uses the service-role client (bypasses RLS) since this only ever runs in
 * trusted server contexts — server components and the admin API routes,
 * which already gate writes behind isAdminAuthenticated().
 */

const TABLE = "products";

/** Row shape as stored in Postgres — snake_case, matches products-schema.sql. */
interface ProductRow {
  id: string;
  sort_order?: number;
  name: string;
  price: number | null;
  category: string;
  variant: string;
  image_url: string | null;
  home_image?: string | null;
  images: string[] | null;
  hover_video?: string | null;
  preorder: boolean;
  visible?: boolean;
  sku?: string | null;
  brand?: string | null;
  conditions?: string[] | null;
  fit?: RobotFit | null;
  specs: Product["specs"];
  tagline: Product["tagline"];
  description: Product["description"];
  features: Product["features"];
  page: ProductPage | null;
}

/**
 * Rows saved before supabase/variant-to-product-type.sql still say which LUBA
 * they are in `variant` ("luba" = LUBA 3, "mini" = LUBA Mini 2), and rely on it
 * for their hover clip and parts diagram. Read them as the new product types
 * and carry those two over, so the site looks the same before and after the
 * migration. Delete once the migration has run.
 */
const LEGACY_VARIANTS: Record<
  string,
  { variant: Product["variant"]; hoverVideo?: string; anatomy?: AnatomyModel }
> = {
  luba: { variant: "mower", hoverVideo: "/videos/hero-banner-luba3.mp4", anatomy: "luba-3" },
  mini: { variant: "mower", hoverVideo: "/videos/hero-luba-mini.mp4", anatomy: "luba-mini-2" },
  install: { variant: "installation" },
};

function withLegacyAnatomy(page: ProductPage, model: AnatomyModel | undefined): ProductPage {
  if (!model || !page.blocks) return page;
  return {
    ...page,
    blocks: page.blocks.map((b) =>
      b.type === "anatomy" && !b.model ? { ...b, model } : b
    ),
  };
}

/** new first, then pre-owned; an empty or missing list reads as new. */
function conditionsOf(raw: string[] | null | undefined): Product["conditions"] {
  const list = (raw ?? []).filter(isStockCondition);
  const ordered = (["new", "pre-owned"] as const).filter((c) => list.includes(c));
  return ordered.length > 0 ? [...ordered] : ["new"];
}

function rowToProduct(row: ProductRow): Product {
  const legacy = LEGACY_VARIANTS[row.variant];
  const hoverVideo = row.hover_video || legacy?.hoverVideo;
  const page = row.page ? withLegacyAnatomy(row.page, legacy?.anatomy) : null;
  return {
    id: row.id,
    ...(typeof row.sort_order === "number" ? { displayOrder: row.sort_order } : {}),
    name: row.name,
    price: row.price,
    category: row.category as CategorySlug,
    variant: legacy?.variant ?? (row.variant as Product["variant"]),
    ...(row.image_url ? { imageUrl: row.image_url } : {}),
    ...(row.home_image ? { homeImage: row.home_image } : {}),
    ...(row.images?.length ? { images: row.images } : {}),
    ...(hoverVideo ? { hoverVideo } : {}),
    preorder: row.preorder,
    // absent column (pre-migration) reads as visible so the storefront never
    // blanks out before add-product-visibility.sql is applied
    visible: row.visible ?? true,
    ...(row.sku ? { sku: row.sku } : {}),
    ...(row.brand ? { brand: row.brand } : {}),
    conditions: conditionsOf(row.conditions),
    ...(row.fit && Object.keys(row.fit).length > 0 ? { fit: row.fit } : {}),
    specs: row.specs ?? {},
    tagline: row.tagline,
    description: row.description,
    features: row.features,
    ...(page ? { page } : {}),
  };
}

const isMissingSortOrder = (error: { code?: string; message?: string } | null) =>
  error?.code === "42703" || error?.message?.includes("sort_order") === true;

// Optional columns added by later migrations (add-product-visibility.sql,
// add-product-sku.sql). Until a migration runs, Postgres reports 42703
// (undefined column) and PostgREST reports PGRST204 (not in the schema cache) —
// either way the message names the column. We strip the named column and retry
// so a product save keeps working before its migration is applied.
const DEGRADABLE_COLUMNS = [
  "visible",
  "sku",
  "hover_video",
  "home_image",
  "brand",
  "conditions",
  "fit",
] as const;

function missingOptionalColumn(
  error: { code?: string; message?: string } | null
): (typeof DEGRADABLE_COLUMNS)[number] | null {
  if (!error || (error.code !== "42703" && error.code !== "PGRST204")) return null;
  return DEGRADABLE_COLUMNS.find((c) => error.message?.includes(c)) ?? null;
}

/** created_at/updated_at are DB-managed (default now() / the touch trigger) — never written from here. */
function productFields(
  product: Product
): Omit<ProductRow, "id" | "sort_order"> {
  return {
    name: product.name,
    price: product.price,
    category: product.category,
    variant: product.variant,
    image_url: product.imageUrl ?? null,
    home_image: product.homeImage ?? null,
    images: product.images ?? [],
    hover_video: product.hoverVideo ?? null,
    preorder: product.preorder ?? false,
    visible: product.visible ?? true,
    sku: product.sku ?? null,
    brand: product.brand ?? null,
    conditions: product.conditions,
    fit: product.fit ?? {},
    specs: product.specs,
    tagline: product.tagline,
    description: product.description,
    features: product.features,
    page: product.page ?? null,
  };
}

/** Every product in display order, hidden ones included. */
async function fetchAllProducts(): Promise<Product[]> {
  const supabase = createServiceClient();
  let result = await supabase
    .from(TABLE)
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  // Keep the storefront available during deployment before the SQL migration
  // is applied. Reordering itself still requires add-product-sort-order.sql.
  if (isMissingSortOrder(result.error)) {
    result = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: true });
  }
  const { data, error } = result;
  if (error) throw new Error(`Failed to load products: ${error.message}`);
  return (data ?? []).map(rowToProduct);
}

/**
 * Storefront catalog — hidden products excluded. Every customer-facing read
 * (shop grid, home, search, checkout repricing) goes through here, so a hidden
 * product is unbuyable and unlinkable, not merely unlisted.
 *
 * Filtering happens in code rather than in the query so this keeps working if
 * the `visible` column doesn't exist yet (absent → treated as visible).
 */
export async function getAllProducts(): Promise<Product[]> {
  const all = await fetchAllProducts();
  return SHOW_HIDDEN ? all : all.filter((p) => p.visible !== false);
}

/**
 * Preview-only switch: set SHOW_HIDDEN_PRODUCTS=1 on Vercel's Preview
 * environment to see hidden products (e.g. robots added but not launched) on
 * a preview deployment. Never on production, whatever the variable says.
 */
const SHOW_HIDDEN =
  process.env.SHOW_HIDDEN_PRODUCTS === "1" && process.env.VERCEL_ENV !== "production";

/** Whether a product is reachable on the storefront (its page, its quote):
 *  visible, or hidden but shown on a preview with SHOW_HIDDEN_PRODUCTS. */
export const showsOnStorefront = (product: Product) =>
  SHOW_HIDDEN || product.visible !== false;

/** Admin catalog — includes hidden products so staff can manage and reveal them. */
export async function getAllProductsForAdmin(): Promise<Product[]> {
  return fetchAllProducts();
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to load product "${id}": ${error.message}`);
  return data ? rowToProduct(data) : undefined;
}

export async function getProductsByCategory(
  category: CategorySlug
): Promise<Product[]> {
  const supabase = createServiceClient();
  let result = await supabase
    .from(TABLE)
    .select("*")
    .eq("category", category)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (isMissingSortOrder(result.error)) {
    result = await supabase
      .from(TABLE)
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: true });
  }
  const { data, error } = result;
  if (error) throw new Error(`Failed to load ${category} products: ${error.message}`);
  // storefront read — hidden products are excluded (except on a preview with
  // SHOW_HIDDEN_PRODUCTS, like getAllProducts)
  const products = (data ?? []).map(rowToProduct);
  return SHOW_HIDDEN ? products : products.filter((p) => p.visible !== false);
}

export async function addProduct(product: Product): Promise<void> {
  const supabase = createServiceClient();
  const fields: Record<string, unknown> = productFields(product);
  // Retry once per degradable column: strip the one the DB doesn't have yet and
  // insert again, so creation works before add-product-{visibility,sku}.sql run.
  let error: { code?: string; message?: string } | null = null;
  for (let attempt = 0; attempt <= DEGRADABLE_COLUMNS.length; attempt++) {
    ({ error } = await supabase.from(TABLE).insert({ id: product.id, ...fields }));
    const missing = missingOptionalColumn(error);
    if (!missing) break;
    delete fields[missing];
  }
  if (error) {
    if (error.code === "23505") {
      throw new Error(`Product id "${product.id}" already exists`);
    }
    throw new Error(`Failed to create product: ${error.message}`);
  }
}

/** Replace the product at `id`. The id itself is immutable. */
export async function updateProduct(id: string, product: Product): Promise<boolean> {
  const supabase = createServiceClient();
  const fields: Record<string, unknown> = productFields(product);
  // Same degradation as addProduct — persist everything the DB does have.
  let result = await supabase.from(TABLE).update(fields).eq("id", id).select("id");
  for (let attempt = 0; attempt < DEGRADABLE_COLUMNS.length; attempt++) {
    const missing = missingOptionalColumn(result.error);
    if (!missing) break;
    delete fields[missing];
    result = await supabase.from(TABLE).update(fields).eq("id", id).select("id");
  }
  const { data, error } = result;
  if (error) throw new Error(`Failed to update product "${id}": ${error.message}`);
  return (data?.length ?? 0) > 0;
}

/** Show/hide a product on the storefront without touching the rest of its data. */
export async function setProductVisibility(
  id: string,
  visible: boolean
): Promise<boolean> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update({ visible })
    .eq("id", id)
    .select("id");
  // This action is nothing *but* the visibility write — it can't degrade, so
  // surface a clear next step instead of a raw column error.
  if (missingOptionalColumn(error) === "visible") {
    throw new Error(
      "Product visibility is not installed yet. Run supabase/add-product-visibility.sql first."
    );
  }
  if (error) throw new Error(`Failed to update visibility for "${id}": ${error.message}`);
  return (data?.length ?? 0) > 0;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .select("id");
  if (error) throw new Error(`Failed to delete product "${id}": ${error.message}`);
  return (data?.length ?? 0) > 0;
}

/** Persist the complete storefront order in one database transaction. */
export async function reorderProducts(ids: string[]): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase.rpc("reorder_products", { product_ids: ids });
  if (error) {
    if (error.code === "PGRST202" || error.message.includes("reorder_products")) {
      throw new Error(
        "Product ordering is not installed yet. Run supabase/add-product-sort-order.sql first."
      );
    }
    throw new Error(`Failed to reorder products: ${error.message}`);
  }
}

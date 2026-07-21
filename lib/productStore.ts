import { createServiceClient } from "@/lib/supabase/service";
import type { CategorySlug } from "@/data/categories";
import type { Product, ProductPage } from "@/data/products";

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
  price: number;
  category: string;
  variant: string;
  image_url: string | null;
  images: string[] | null;
  preorder: boolean;
  visible?: boolean;
  specs: Product["specs"];
  tagline: Product["tagline"];
  description: Product["description"];
  features: Product["features"];
  page: ProductPage | null;
}

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    ...(typeof row.sort_order === "number" ? { displayOrder: row.sort_order } : {}),
    name: row.name,
    price: row.price,
    category: row.category as CategorySlug,
    variant: row.variant as Product["variant"],
    ...(row.image_url ? { imageUrl: row.image_url } : {}),
    ...(row.images?.length ? { images: row.images } : {}),
    preorder: row.preorder,
    // absent column (pre-migration) reads as visible so the storefront never
    // blanks out before add-product-visibility.sql is applied
    visible: row.visible ?? true,
    specs: row.specs ?? {},
    tagline: row.tagline,
    description: row.description,
    features: row.features,
    ...(row.page ? { page: row.page } : {}),
  };
}

const isMissingSortOrder = (error: { code?: string; message?: string } | null) =>
  error?.code === "42703" || error?.message?.includes("sort_order") === true;

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
    images: product.images ?? [],
    preorder: product.preorder ?? false,
    visible: product.visible ?? true,
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
  return (await fetchAllProducts()).filter((p) => p.visible !== false);
}

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
  // storefront read — hidden products are excluded
  return (data ?? []).map(rowToProduct).filter((p) => p.visible !== false);
}

export async function addProduct(product: Product): Promise<void> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from(TABLE)
    .insert({ id: product.id, ...productFields(product) });
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
  const { data, error } = await supabase
    .from(TABLE)
    .update(productFields(product))
    .eq("id", id)
    .select("id");
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

import { createServiceClient } from "@/lib/supabase/service";
import type { CategorySlug } from "@/data/categories";
import type { Product } from "@/data/products";

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
  name: string;
  price: number;
  category: string;
  variant: string;
  image_url: string | null;
  preorder: boolean;
  specs: Product["specs"];
  tagline: Product["tagline"];
  description: Product["description"];
  features: Product["features"];
}

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    category: row.category as CategorySlug,
    variant: row.variant as Product["variant"],
    ...(row.image_url ? { imageUrl: row.image_url } : {}),
    preorder: row.preorder,
    specs: row.specs ?? {},
    tagline: row.tagline,
    description: row.description,
    features: row.features,
  };
}

/** created_at/updated_at are DB-managed (default now() / the touch trigger) — never written from here. */
function productFields(product: Product): Omit<ProductRow, "id"> {
  return {
    name: product.name,
    price: product.price,
    category: product.category,
    variant: product.variant,
    image_url: product.imageUrl ?? null,
    preorder: product.preorder ?? false,
    specs: product.specs,
    tagline: product.tagline,
    description: product.description,
    features: product.features,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Failed to load products: ${error.message}`);
  return (data ?? []).map(rowToProduct);
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
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Failed to load ${category} products: ${error.message}`);
  return (data ?? []).map(rowToProduct);
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

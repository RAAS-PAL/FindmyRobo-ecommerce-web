import { promises as fs } from "fs";
import path from "path";
import type { CategorySlug } from "@/data/categories";
import type { Product } from "@/data/products";

/**
 * File-backed product store — the single read/write path for product data.
 *
 * NOTE: JSON-on-disk works for local dev and demos but does NOT persist on
 * Vercel serverless (read-only bundle). When the database lands (Supabase),
 * only this module changes; every caller keeps the same async interface.
 */

const FILE = path.join(process.cwd(), "data", "products.json");

async function readAll(): Promise<Product[]> {
  const raw = await fs.readFile(FILE, "utf8");
  return JSON.parse(raw) as Product[];
}

async function writeAll(products: Product[]): Promise<void> {
  await fs.writeFile(FILE, JSON.stringify(products, null, 2) + "\n", "utf8");
}

export async function getAllProducts(): Promise<Product[]> {
  return readAll();
}

export async function getProductById(id: string): Promise<Product | undefined> {
  return (await readAll()).find((p) => p.id === id);
}

export async function getProductsByCategory(
  category: CategorySlug
): Promise<Product[]> {
  return (await readAll()).filter((p) => p.category === category);
}

export async function addProduct(product: Product): Promise<void> {
  const products = await readAll();
  if (products.some((p) => p.id === product.id)) {
    throw new Error(`Product id "${product.id}" already exists`);
  }
  await writeAll([...products, product]);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const products = await readAll();
  const next = products.filter((p) => p.id !== id);
  if (next.length === products.length) return false;
  await writeAll(next);
  return true;
}

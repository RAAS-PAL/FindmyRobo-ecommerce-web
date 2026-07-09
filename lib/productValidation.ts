import { categories } from "@/data/categories";
import {
  ROBOT_VARIANTS,
  SPEC_KEYS,
  type Product,
  type SpecKey,
} from "@/data/products";

/**
 * Shared server-side validation for the admin product create/update routes.
 * Returns the parsed Product, or a human-readable error string.
 */

export const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const asText = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Split textarea input into feature lines, dropping blanks. */
const asLines = (v: unknown) =>
  asText(v)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

export function parseProduct(body: Record<string, unknown>): Product | string {
  const name = asText(body.name);
  if (!name) return "Product name is required";

  const price = Number(body.price);
  if (!Number.isFinite(price) || price <= 0) return "Price must be a positive number";

  const category = asText(body.category);
  if (!categories.some((c) => c.slug === category)) return "Unknown category";

  const variant = asText(body.variant);
  if (!ROBOT_VARIANTS.includes(variant as Product["variant"]))
    return "Unknown illustration variant";

  const taglineEn = asText(body.taglineEn);
  const taglineTh = asText(body.taglineTh);
  const descriptionEn = asText(body.descriptionEn);
  const descriptionTh = asText(body.descriptionTh);
  if (!taglineEn || !taglineTh) return "Tagline is required in both languages";
  if (!descriptionEn || !descriptionTh)
    return "Description is required in both languages";

  const featuresEn = asLines(body.featuresEn);
  const featuresTh = asLines(body.featuresTh);
  if (featuresEn.length === 0 || featuresTh.length === 0)
    return "At least one feature line is required in both languages";

  const specs: Partial<Record<SpecKey, string>> = {};
  for (const key of SPEC_KEYS) {
    const value = asText(body[`spec_${key}`]);
    if (value) specs[key] = value;
  }

  const id = asText(body.id) || slugify(name);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) return "Invalid product id";

  return {
    id,
    name,
    price: Math.round(price),
    category: category as Product["category"],
    variant: variant as Product["variant"],
    ...(body.preorder ? { preorder: true } : {}),
    specs,
    tagline: { en: taglineEn, th: taglineTh },
    description: { en: descriptionEn, th: descriptionTh },
    features: { en: featuresEn, th: featuresTh },
  };
}

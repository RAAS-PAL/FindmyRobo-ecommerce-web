import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { addProduct } from "@/lib/productStore";
import { categories } from "@/data/categories";
import {
  ROBOT_VARIANTS,
  SPEC_KEYS,
  type Product,
  type SpecKey,
} from "@/data/products";

const slugify = (name: string) =>
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

function parseProduct(body: Record<string, unknown>): Product | string {
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

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseProduct(body);
  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  try {
    await addProduct(parsed);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not save product" },
      { status: 409 }
    );
  }

  // regenerate every cached page that lists products
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, id: parsed.id }, { status: 201 });
}

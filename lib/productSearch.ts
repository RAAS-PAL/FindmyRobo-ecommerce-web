import { categories } from "@/data/categories";
import type { CategorySlug } from "@/data/categories";
import type { Locale, Product } from "@/data/products";

const normalize = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

export function searchProducts(
  products: Product[],
  query: string,
  locale: Locale,
  categoryLabel?: (slug: CategorySlug) => string
): Product[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

  return products
    .map((product, catalogIndex) => {
      const category = categories.find((item) => item.slug === product.category);
      const fields = [
        { value: normalize(product.name), weight: 12 },
        { value: normalize(product.id), weight: 8 },
        { value: normalize(categoryLabel?.(product.category) ?? category?.name ?? product.category), weight: 7 },
        { value: normalize(category?.description ?? ""), weight: 4 },
        { value: normalize(product.tagline[locale] || product.tagline.en), weight: 6 },
        { value: normalize(product.description[locale] || product.description.en), weight: 3 },
        { value: normalize((product.features[locale] || product.features.en).join(" ")), weight: 3 },
        { value: normalize(Object.values(product.specs).join(" ")), weight: 2 },
      ];
      const combined = fields.map((field) => field.value).join(" ");
      if (!tokens.every((token) => combined.includes(token))) return null;

      let score = 0;
      for (const token of tokens) {
        for (const field of fields) {
          if (field.value === token) score += field.weight * 4;
          else if (field.value.startsWith(token)) score += field.weight * 2;
          else if (field.value.includes(token)) score += field.weight;
        }
      }
      if (fields[0].value.includes(normalizedQuery)) score += 30;
      return { product, score, catalogIndex };
    })
    .filter((result): result is NonNullable<typeof result> => result !== null)
    .sort((a, b) => b.score - a.score || a.catalogIndex - b.catalogIndex)
    .map((result) => result.product);
}

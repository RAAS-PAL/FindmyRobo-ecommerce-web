import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { modelPages } from "@/data/modelPages";
import { routing } from "@/i18n/routing";
import { getAllProducts } from "@/lib/productStore";
import { localizedUrl as localizedPath } from "@/lib/seo";

/** hreflang alternates, so Google serves the right language per visitor.
 *  Same URL builder the page metadata uses, so sitemap and <head> agree. */
const alternates = (path: string) => ({
  languages: Object.fromEntries(
    routing.locales.map((locale) => [locale, localizedPath(locale, path)])
  ),
});

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();

  const staticPaths: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/shop", priority: 0.9, changeFrequency: "weekly" },
    { path: "/compare", priority: 0.5, changeFrequency: "monthly" },
    { path: "/recommend", priority: 0.7, changeFrequency: "monthly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/contact-sales", priority: 0.7, changeFrequency: "monthly" },
    { path: "/location", priority: 0.6, changeFrequency: "monthly" },
    { path: "/refund-policy", priority: 0.5, changeFrequency: "monthly" },
    { path: "/order-status", priority: 0.3, changeFrequency: "monthly" },
  ];

  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  for (const { path, priority, changeFrequency } of staticPaths) {
    for (const locale of routing.locales) {
      entries.push({
        url: localizedPath(locale, path),
        lastModified: now,
        changeFrequency,
        priority,
        alternates: alternates(path),
      });
    }
  }

  for (const category of categories) {
    const path = `/shop/${category.slug}`;
    for (const locale of routing.locales) {
      entries.push({
        url: localizedPath(locale, path),
        lastModified: now,
        changeFrequency: "weekly",
        // Coming-soon categories are real pages but have nothing to sell yet.
        priority: category.available ? 0.8 : 0.4,
        alternates: alternates(path),
      });
    }
  }

  // product pages built in code, for models not in the catalogue yet
  for (const page of modelPages) {
    const path = `/products/${page.id}`;
    for (const locale of routing.locales) {
      entries.push({
        url: localizedPath(locale, path),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: alternates(path),
      });
    }
  }

  for (const product of products) {
    if (product.visible === false) continue;
    const path = `/products/${product.id}`;
    for (const locale of routing.locales) {
      entries.push({
        url: localizedPath(locale, path),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: alternates(path),
      });
    }
  }

  return entries;
}

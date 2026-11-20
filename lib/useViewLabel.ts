"use client";

import { useLocale, useTranslations } from "next-intl";
import { useProducts } from "@/components/ProductsProvider";
import { productLabel } from "@/data/products";
import { categories } from "@/data/categories";

/**
 * The words on a button that opens a robot's page or a category list, from
 * where it goes: "View T-Chef TC-E10A", "See all delivery robots". One rule
 * for the whole site, so the same action is not "Learn more" here and "View
 * product" there, and a list never hides behind a robot-sounding label.
 */
export function useViewLabel() {
  const t = useTranslations("viewLabel");
  const tc = useTranslations("categories");
  const locale = useLocale();
  const { getProduct } = useProducts();

  return (href: string): string => {
    const productId = href.match(/^\/products\/([^/?#]+)/)?.[1];
    const product = productId ? getProduct(productId) : undefined;
    if (product) return t("robot", { name: productLabel(product) });

    const slug = href.match(/^\/shop\/([^/?#]+)/)?.[1];
    const category = categories.find((c) => c.slug === slug);
    if (category) {
      const name = tc(`${category.slug}.name`);
      return t("list", { name: locale === "en" ? name.toLowerCase() : name });
    }
    return t("robots");
  };
}

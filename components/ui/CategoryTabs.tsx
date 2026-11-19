"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categories, type CategorySlug } from "@/data/categories";
import { useProducts } from "@/components/ProductsProvider";
import { SERVICE_CATEGORY } from "@/data/products";

/**
 * One tab in a category row: the home lineup's filter buttons and the shop's
 * category links look the same. The current one is bold with a 2 px accent
 * line on the row's bottom border; it changes at once, it does not slide.
 */
export function categoryTabClass(active: boolean) {
  return `relative flex min-h-11 shrink-0 cursor-pointer items-center px-1 text-small whitespace-nowrap transition-colors duration-150 ${
    active
      ? "font-semibold text-content after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent"
      : "font-medium text-ink-muted hover:text-content"
  }`;
}

/**
 * Category links for the shop pages, in the same row style as the homepage
 * lineup. A category with no robot on show is left out, as the navbar does;
 * there are no "coming soon" tabs. Services are not a category tab: the shop
 * lists them under the robots.
 */
export default function CategoryTabs({ active }: { active?: CategorySlug }) {
  const t = useTranslations("shop");
  const tc = useTranslations("categories");
  const { products } = useProducts();
  const stocked = new Set(products.map((product) => product.category));
  const shown = categories.filter(
    (c) => c.available && c.slug !== SERVICE_CATEGORY && stocked.has(c.slug)
  );

  return (
    <nav
      aria-label={t("categoriesLabel")}
      className="no-scrollbar flex gap-6 overflow-x-auto border-b border-forest-100 dark:border-forest-700"
    >
      <Link href="/shop" aria-current={!active ? "page" : undefined} className={categoryTabClass(!active)}>
        {t("all")}
      </Link>
      {shown.map((c) => (
        <Link
          key={c.slug}
          href={`/shop/${c.slug}`}
          aria-current={active === c.slug ? "page" : undefined}
          className={categoryTabClass(active === c.slug)}
        >
          {tc(`${c.slug}.nav`)}
        </Link>
      ))}
    </nav>
  );
}

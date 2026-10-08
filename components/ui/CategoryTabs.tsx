"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categories, type CategorySlug } from "@/data/categories";
import { useProducts } from "@/components/ProductsProvider";

/**
 * Filter pills for the shop pages. A category marked available but with no
 * robot on the storefront is left out, the same way the navbar drops an empty
 * tab. Coming-soon categories stay, labelled and not clickable.
 */
export default function CategoryTabs({ active }: { active?: CategorySlug }) {
  const t = useTranslations("shop");
  const tc = useTranslations("categories");
  const tn = useTranslations("nav");
  const { products } = useProducts();
  const stocked = new Set(products.map((product) => product.category));

  const base =
    "flex min-h-[44px] items-center gap-2 rounded-full border px-5 text-[13.5px] font-semibold transition-colors";

  return (
    <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      <Link
        href="/shop"
        className={`${base} ${
          !active
            ? "border-forest bg-forest text-white"
            : "border-forest-100 bg-surface text-content hover:border-accent hover:bg-accent/10"
        }`}
      >
        {t("all")}
      </Link>
      {categories.map((c) => {
        if (c.available && !stocked.has(c.slug)) return null;
        if (!c.available) {
          return (
            <span
              key={c.slug}
              aria-disabled="true"
              className={`${base} cursor-default border-forest-100 bg-cloud whitespace-nowrap text-ink-muted/60`}
            >
              {tc(`${c.slug}.name`)}
              <span className="rounded-full bg-accent/20 px-2 py-0.5 font-mono text-[9px] font-semibold tracking-wider text-accent-600 uppercase">
                {tn("soon")}
              </span>
            </span>
          );
        }
        return (
          <Link
            key={c.slug}
            href={`/shop/${c.slug}`}
            className={`${base} whitespace-nowrap ${
              active === c.slug
                ? "border-forest bg-forest text-white"
                : "border-forest-100 bg-surface text-content hover:border-accent hover:bg-accent/10"
            }`}
          >
            {tc(`${c.slug}.name`)}
          </Link>
        );
      })}
    </div>
  );
}

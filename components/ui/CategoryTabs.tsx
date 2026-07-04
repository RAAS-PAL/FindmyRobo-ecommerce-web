"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categories, type CategorySlug } from "@/data/categories";

/**
 * Filter pills for the shop pages. Coming-soon categories are shown
 * (so visitors see the store is bigger than mowers) but not clickable.
 */
export default function CategoryTabs({ active }: { active?: CategorySlug }) {
  const t = useTranslations("shop");
  const tc = useTranslations("categories");
  const tn = useTranslations("nav");

  const base =
    "flex min-h-[44px] items-center gap-2 rounded-full border px-5 text-[13.5px] font-semibold transition-colors";

  return (
    <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      <Link
        href="/shop"
        className={`${base} ${
          !active
            ? "border-navy bg-navy text-white"
            : "border-navy-100 bg-white text-navy hover:border-gold hover:bg-gold/10"
        }`}
      >
        {t("all")}
      </Link>
      {categories.map((c) =>
        c.available ? (
          <Link
            key={c.slug}
            href={`/shop/${c.slug}`}
            className={`${base} whitespace-nowrap ${
              active === c.slug
                ? "border-navy bg-navy text-white"
                : "border-navy-100 bg-white text-navy hover:border-gold hover:bg-gold/10"
            }`}
          >
            {tc(`${c.slug}.name`)}
          </Link>
        ) : (
          <span
            key={c.slug}
            aria-disabled="true"
            className={`${base} whitespace-nowrap cursor-default border-navy-100 bg-cloud text-ink-muted/60`}
          >
            {tc(`${c.slug}.name`)}
            <span className="rounded-full bg-gold/20 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-gold-600">
              {tn("soon")}
            </span>
          </span>
        )
      )}
    </div>
  );
}

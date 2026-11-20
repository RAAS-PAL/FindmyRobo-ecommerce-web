"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useProducts } from "@/components/ProductsProvider";
import { useQuote } from "@/components/quote/QuoteProvider";
import Button from "@/components/ui/Button";
import MetaLine from "@/components/ui/MetaLine";
import { categoryTabClass } from "@/components/ui/CategoryTabs";
import { DEFAULT_BRAND, SERVICE_CATEGORY, productLabel, type Locale, type Product, type SpecKey } from "@/data/products";
import { canOptimise } from "@/lib/media";
import { useViewLabel } from "@/lib/useViewLabel";

const SPECS: SpecKey[] = ["area", "slope", "runtime", "cuttingWidth", "filtration", "connectivity"];
const specsOf = (p: Product) => SPECS.filter((k) => p.specs?.[k]).slice(0, 3);

/** A robot's picture standing on the page itself: no tile around it. */
function Cutout({ product, sizes, className }: { product: Product; sizes: string; className: string }) {
  const label = productLabel(product);
  if (!product.imageUrl) return <div className={className} />;
  return (
    <div className={`relative ${className}`}>
      {canOptimise(product.imageUrl) ? (
        <Image src={product.imageUrl} alt={label} fill sizes={sizes} className="object-contain" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- any admin URL
        <img src={product.imageUrl} alt={label} loading="lazy" className="absolute inset-0 h-full w-full object-contain" />
      )}
    </div>
  );
}

/**
 * The homepage robot range, without boxes (2026-11-20). One robot leads,
 * large, with its figures beside it; the others stand in a row on the same
 * band, hairlines between them, scrolled sideways with the arrows or a
 * swipe. The tabs narrow the range to one kind of robot.
 */
export default function RobotLineup() {
  const t = useTranslations("products");
  const tc = useTranslations("categories");
  const td = useTranslations("productDetail");
  const ts = useTranslations("showcase");
  const viewLabel = useViewLabel();
  const locale = useLocale() as Locale;
  const { products } = useProducts();
  const { openQuote } = useQuote();
  const robots = products.filter((p) => p.category !== SERVICE_CATEGORY);
  const categories = [...new Set(robots.map((p) => p.category))];
  const [category, setCategory] = useState<string | null>(null);
  const shown = category ? robots.filter((p) => p.category === category) : robots;
  const [lead, ...rest] = shown;
  const railRef = useRef<HTMLUListElement>(null);
  if (!lead) return null;

  // one robot per press, whatever its width at this breakpoint
  const scrollBy = (dir: 1 | -1) => {
    const rail = railRef.current;
    const item = rail?.firstElementChild as HTMLElement | null;
    rail?.scrollBy({ left: dir * (item?.offsetWidth ?? 280), behavior: "smooth" });
  };
  const pick = (next: string | null) => {
    setCategory(next);
    railRef.current?.scrollTo({ left: 0 });
  };
  const arrowClass =
    "flex h-11 w-11 cursor-pointer items-center justify-center rounded-control border border-forest-100 text-content transition-[border-color,scale] duration-150 hover:border-content active:scale-[0.97] dark:border-forest-700";

  return (
    <section id="products" className="bg-cloud py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-title text-content">{t("heading")}</h2>
        {categories.length > 1 && (
          <div
            role="group"
            aria-label={t("filterLabel")}
            className="no-scrollbar mt-6 flex gap-6 overflow-x-auto border-b border-forest-100 dark:border-forest-700"
          >
            <button type="button" aria-pressed={category === null} onClick={() => pick(null)} className={categoryTabClass(category === null)}>
              {t("all")}
            </button>
            {categories.map((c) => (
              <button key={c} type="button" aria-pressed={category === c} onClick={() => pick(c)} className={categoryTabClass(category === c)}>
                {tc(`${c}.nav`)}
              </button>
            ))}
          </div>
        )}

        {/* the lead robot: large, its figures beside it */}
        <div className="grid items-center gap-8 py-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16 lg:py-16">
          <Link href={`/products/${lead.id}`} aria-label={productLabel(lead)}>
            <Cutout product={lead} sizes="(min-width: 1024px) 55vw, 100vw" className="aspect-[16/9] w-full" />
          </Link>
          <div>
            <MetaLine>
              {lead.brand ?? DEFAULT_BRAND} · {tc(`${lead.category}.nav`)}
            </MetaLine>
            <h3 className="mt-2 font-display text-display text-content">{productLabel(lead)}</h3>
            <p className="mt-4 max-w-md text-lead text-ink-muted">{lead.tagline[locale]}</p>
            {specsOf(lead).length > 0 && (
              <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
                {specsOf(lead).map((key) => (
                  <div key={key} className="flex flex-col-reverse">
                    <dt className="mt-1 text-small text-ink-muted">{td(`specLabels.${key}`)}</dt>
                    <dd className="font-display text-title text-content tabular-nums">{lead.specs[key]}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={`/products/${lead.id}`} size="lg">
                {viewLabel(`/products/${lead.id}`)}
              </Button>
              <Button size="lg" variant="secondary" onClick={() => openQuote({ productId: lead.id })}>
                {ts("getQuote")}
              </Button>
            </div>
          </div>
        </div>

        {/* the others: one row on the band itself, hairlines between them,
            scrolled sideways */}
        {rest.length > 0 && (
          <>
            {/* the arrows sit with the row they move */}
            <div className="flex justify-end gap-2 pb-4">
              <button type="button" onClick={() => scrollBy(-1)} aria-label={t("scrollLeft")} className={arrowClass}>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => scrollBy(1)} aria-label={t("scrollRight")} className={arrowClass}>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          <ul
            ref={railRef}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto border-y border-forest-100 dark:border-forest-700"
          >
            {rest.map((product) => (
              <li
                key={product.id}
                className="w-[240px] shrink-0 snap-start border-l border-forest-100 first:border-l-0 sm:w-[280px] dark:border-forest-700"
              >
                <Link href={`/products/${product.id}`} className="group block px-5 py-8">
                  <Cutout product={product} sizes="280px" className="aspect-[4/3] w-full" />
                  <MetaLine className="mt-5">
                    {product.brand ?? DEFAULT_BRAND} · {tc(`${product.category}.nav`)}
                  </MetaLine>
                  <h3 className="mt-1 text-heading text-content underline-offset-4 group-hover:underline">
                    {productLabel(product)}
                  </h3>
                  {specsOf(product).length > 0 && (
                    <p className="mt-1 text-small text-ink-muted tabular-nums">
                      {specsOf(product)
                        .map((k) => product.specs[k])
                        .join(" · ")}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          </>
        )}
      </div>
    </section>
  );
}

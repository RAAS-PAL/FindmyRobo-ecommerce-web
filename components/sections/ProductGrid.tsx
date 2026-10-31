"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FeaturedProductCard from "@/components/ui/FeaturedProductCard";
import { useProducts } from "@/components/ProductsProvider";
import { SERVICE_CATEGORY } from "@/data/products";

/** Gap between cards, in px — matches `gap-6` on the scroller. */
const CARD_GAP = 24;

export default function ProductGrid() {
  const t = useTranslations("products");
  const tc = useTranslations("categories");
  const { products } = useProducts();
  // Home carousel is robots only — installation/demo service packages are
  // bought from the shop or the checkout upsell, not featured here.
  const robots = products.filter((p) => p.category !== SERVICE_CATEGORY);
  // one tab per category with a robot on show, in catalogue order
  const categories = [...new Set(robots.map((p) => p.category))];
  const [category, setCategory] = useState<string | null>(null);
  const shown = category ? robots.filter((p) => p.category === category) : robots;
  const scrollerRef = useRef<HTMLDivElement>(null);

  // one card per press, whatever the card width at this breakpoint
  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    const card = el?.firstElementChild as HTMLElement | null;
    el?.scrollBy({ left: dir * ((card?.offsetWidth ?? 360) + CARD_GAP), behavior: "smooth" });
  };
  const pick = (next: string | null) => {
    setCategory(next);
    scrollerRef.current?.scrollTo({ left: 0 });
  };

  const tabClass = (on: boolean) =>
    `relative min-h-11 shrink-0 cursor-pointer px-1 text-[14px] font-semibold whitespace-nowrap transition-colors ${
      on
        ? "text-content after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent"
        : "text-ink-muted hover:text-content"
    }`;

  return (
    <section id="products" className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-mono text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase [&:lang(th)]:tracking-[0.06em]">
              {t("eyebrow")}
            </p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-extrabold tracking-tight text-content sm:text-5xl">
              {t("heading")}
            </h2>
          </motion.div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label={t("scrollLeft")}
              className="flex h-11 w-11 cursor-pointer items-center justify-center border border-forest-100 text-content transition-colors hover:border-content dark:border-forest-700"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label={t("scrollRight")}
              className="flex h-11 w-11 cursor-pointer items-center justify-center border border-forest-100 text-content transition-colors hover:border-content dark:border-forest-700"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* category tabs: the lineup narrows to one kind of robot */}
        {categories.length > 1 && (
          <div
            role="group"
            aria-label={t("filterLabel")}
            className="no-scrollbar mt-8 flex gap-6 overflow-x-auto border-b border-forest-100 dark:border-forest-700"
          >
            <button type="button" aria-pressed={category === null} onClick={() => pick(null)} className={tabClass(category === null)}>
              {t("all")}
            </button>
            {categories.map((c) => (
              <button key={c} type="button" aria-pressed={category === c} onClick={() => pick(c)} className={tabClass(category === c)}>
                {tc(`${c}.nav`)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        ref={scrollerRef}
        className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-4 px-4 pb-4 sm:scroll-px-6 sm:px-6 lg:scroll-px-8 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
      >
        {shown.map((product, i) => (
          <FeaturedProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </section>
  );
}

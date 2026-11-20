"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import RobotCard from "@/components/ui/RobotCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { categoryTabClass } from "@/components/ui/CategoryTabs";
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

  const arrowClass =
    "flex h-11 w-11 cursor-pointer items-center justify-center rounded-control border border-forest-100 text-content transition-[border-color,scale] duration-150 hover:border-content active:scale-[0.97] dark:border-forest-700";

  return (
    <section id="products" className="bg-surface py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={t("heading")}
          action={
            <div className="flex gap-2">
              <button type="button" onClick={() => scrollBy(-1)} aria-label={t("scrollLeft")} className={arrowClass}>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => scrollBy(1)} aria-label={t("scrollRight")} className={arrowClass}>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          }
        />

        {/* category tabs: the lineup narrows to one kind of robot */}
        {categories.length > 1 && (
          <div
            role="group"
            aria-label={t("filterLabel")}
            className="no-scrollbar mt-8 flex gap-6 overflow-x-auto border-b border-forest-100 dark:border-forest-700"
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
      </div>

      <div
        ref={scrollerRef}
        // The snap padding equals the left padding, so the first card rests
        // under the headline's left edge instead of being snapped past it.
        className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-4 px-4 pb-4 sm:scroll-px-6 sm:px-6 lg:scroll-px-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
      >
        {shown.map((product) => (
          <RobotCard key={product.id} product={product} layout="rail" />
        ))}
      </div>
    </section>
  );
}

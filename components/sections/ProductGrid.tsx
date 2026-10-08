"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FeaturedProductCard from "@/components/ui/FeaturedProductCard";
import { useProducts } from "@/components/ProductsProvider";
import { SERVICE_CATEGORY } from "@/data/products";

export default function ProductGrid() {
  const t = useTranslations("products");
  const { products } = useProducts();
  // Home carousel is robots only — installation/demo service packages are
  // bought from the shop or the checkout upsell, not featured here.
  const robots = products.filter((p) => p.category !== SERVICE_CATEGORY);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) =>
    scrollerRef.current?.scrollBy({ left: dir * 424, behavior: "smooth" });

  return (
    <section id="products" className="mt-3 bg-accent-50 py-20 sm:mt-4 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-600">
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
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-forest-100 text-content transition-colors hover:border-accent hover:bg-accent/10"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label={t("scrollRight")}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-forest-100 text-content transition-colors hover:border-accent hover:bg-accent/10"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-4 px-4 pb-6 pt-2 sm:scroll-px-6 sm:px-6 lg:scroll-px-8 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
      >
        {robots.map((product, i) => (
          <FeaturedProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </section>
  );
}

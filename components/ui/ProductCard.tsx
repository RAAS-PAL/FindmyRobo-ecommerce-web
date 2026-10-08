"use client";

import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import ProductVisual from "@/components/ui/ProductVisual";
import { productLabel, type Locale, type Product } from "@/data/products";
import { showsCondition } from "@/data/conditions";
import ConditionLine from "@/components/ui/ConditionLine";
import PriceOrQuote from "@/components/ui/PriceOrQuote";

export default function ProductCard({
  product,
  index,
  size = "default",
  displayName,
  displayTagline,
}: {
  product: Product;
  index: number;
  /** "lg" (~1.3×) is used in the home carousel; grids keep "default". */
  size?: "default" | "lg";
  /**
   * Overrides the catalogue name/tagline for cards that stand in for a group of
   * products — the installation tiers collapse to one card, so its own name
   * ("…— Up to 1,000 m²") would misdescribe what the card links to. The product
   * itself is untouched; this is presentation only.
   */
  displayName?: string;
  displayTagline?: string;
}) {
  const big = size === "lg";
  const t = useTranslations("products");
  const tc = useTranslations("categories");
  const locale = useLocale() as Locale;

  const hoverVideo = product.hoverVideo;
  const videoRef = useRef<HTMLVideoElement>(null);

  // Play from the start on hover/focus; reset when the pointer leaves so the
  // next hover always begins at frame 0. Muted, so autoplay is allowed.
  const playVideo = () => {
    const el = videoRef.current;
    if (!el) return;
    el.play().catch(() => undefined);
  };
  const stopVideo = () => {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: index * 0.09, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={playVideo}
      onMouseLeave={stopVideo}
      onFocus={playVideo}
      onBlur={stopVideo}
      className={`group relative shrink-0 snap-start ${
        big ? "w-[340px] sm:w-[390px]" : "w-[280px] sm:w-[300px]"
      }`}
    >
      <Link
        href={`/products/${product.id}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-forest-100 bg-surface transition-all duration-300 hover:-translate-y-2 hover:border-accent hover:shadow-[0_24px_48px_-16px_rgba(0,0,0,0.25)]"
      >
        {/* image area — image at rest, hover reveals a looping clip of the robot */}
        <div
          className={`relative flex items-center overflow-hidden bg-gradient-to-b from-cloud to-forest-100/40 px-3 pb-3 pt-7 ${
            big ? "min-h-[312px]" : "min-h-60"
          }`}
        >
          {/* second-hand stock is labelled wherever it appears */}
          {showsCondition(product.conditions) && (
            <ConditionLine
              conditions={product.conditions}
              stack
              className="absolute top-3 left-3 z-10"
            />
          )}
          {product.preorder && (
            <span className="absolute right-4 top-4 z-10 rounded-full bg-forest-950 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-accent-300">
              {t("preorder")}
            </span>
          )}
          <ProductVisual
            product={product}
            className={`mx-auto max-h-full w-full transition-transform duration-500 ease-out group-hover:scale-105 ${
              big ? "h-[268px]" : "h-52"
            }`}
          />
          {/* hover video: full-bleed over the image, cross-fades in on hover.
              preload="none" so nothing downloads until the pointer arrives. */}
          {hoverVideo && (
            <video
              ref={videoRef}
              src={hoverVideo}
              muted
              loop
              playsInline
              preload="none"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100"
            />
          )}
          {/* view product — slides up on hover / focus (sits above the video) */}
          <span className="absolute inset-x-0 bottom-0 z-10 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-within:translate-y-0">
            <span className="flex min-h-[44px] w-full items-center justify-center gap-1.5 bg-forest py-3 text-sm font-semibold text-white">
              {t("viewProduct")}
              <ArrowUpRight className="h-4 w-4 text-accent-300" aria-hidden="true" />
            </span>
          </span>
        </div>

        {/* details */}
        <span className="flex flex-1 flex-col gap-1.5 p-5">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-600">
            {tc(`${product.category}.name`)}
          </span>
          <span className="font-display text-[15px] font-bold leading-snug text-content">
            {displayName ?? productLabel(product)}
          </span>
          <span className="text-[13px] leading-relaxed text-ink-muted">
            {displayTagline ?? product.tagline[locale]}
          </span>
          <span className="mt-auto pt-3">
            <PriceOrQuote
              amount={product.price}
              className="font-mono text-lg font-semibold tabular-nums text-content"
              quoteClassName="text-[13.5px] font-bold text-accent-600"
            />
          </span>
        </span>
      </Link>
    </motion.article>
  );
}

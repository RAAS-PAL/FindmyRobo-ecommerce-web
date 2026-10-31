"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import RobotIllustration from "@/components/ui/RobotIllustration";
import { DEFAULT_BRAND, productLabel, type Locale, type Product, type SpecKey } from "@/data/products";
import { showsCondition } from "@/data/conditions";
import ConditionLine from "@/components/ui/ConditionLine";
import PriceOrQuote from "@/components/ui/PriceOrQuote";

/**
 * Which quick specs to surface on the card, best-differentiator first. Only the
 * first few a product actually has are shown, so a pool cleaner (no slope)
 * falls through to filtration rather than rendering a gap.
 *
 * Specs rather than `features`: these are short, and every robot states them in
 * the same unit, so a visitor can line two cards up and read the difference.
 * `features` is prose written per product — it compares badly at a glance.
 */
const CARD_SPECS: SpecKey[] = [
  "area",
  "slope",
  "runtime",
  "cuttingWidth",
  "filtration",
  "connectivity",
];
const MAX_CARD_SPECS = 3;

/**
 * Product tile for the home lineup (2026-10-27, after dobot-robots.com): a
 * square-cornered light tile with the brand and category, the name and one
 * line, then the robot's transparent cut-out, its key figures and the price.
 * Interactive without colour: on hover (or focus) an accent line draws across
 * the top, the robot lifts, the arrow nudges forward, and a robot with a clip
 * plays it in the picture's place. Touch: the first tap plays the clip, the
 * second opens the product.
 *
 * The plainer top-image + details card (components/ui/ProductCard.tsx) is still
 * used on the shop, search, and related-products grids.
 */

export default function FeaturedProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const t = useTranslations("products");
  const td = useTranslations("productDetail");
  const tc = useTranslations("categories");
  const locale = useLocale() as Locale;
  const specs = CARD_SPECS.filter((key) => product.specs?.[key]).slice(
    0,
    MAX_CARD_SPECS
  );

  const label = productLabel(product);
  const hoverVideo = product.hoverVideo;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const touchedRef = useRef(false);
  const wasActiveRef = useRef(false);
  const playVideo = () => videoRef.current?.play().catch(() => undefined);
  const stopVideo = () => {
    setActive(false);
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  };
  // Touch devices have no hover: the first tap plays the clip in place, and a
  // second tap opens the product — so a tap isn't wasted on the preview. A
  // robot without a clip opens on the first tap.
  const onTouchStart = () => {
    touchedRef.current = true;
    wasActiveRef.current = active || !hoverVideo;
    if (!active && hoverVideo) {
      setActive(true);
      playVideo();
    }
  };
  const onLinkClick = (e: React.MouseEvent) => {
    if (touchedRef.current && !wasActiveRef.current) e.preventDefault();
    touchedRef.current = false;
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      // a small share in view is enough, so the card peeking at the edge shows
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.5, delay: Math.min(index, 4) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={playVideo}
      onMouseLeave={stopVideo}
      onFocus={playVideo}
      onBlur={stopVideo}
      onTouchStart={onTouchStart}
      className="group relative flex w-[300px] shrink-0 snap-start bg-cloud transition-colors duration-300 hover:bg-forest-100/60 sm:w-[360px] dark:hover:bg-forest-800/60"
    >
      {/* the one accent: a line drawn across the top on hover and focus */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[3px] origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-within:scale-x-100 motion-reduce:transition-none"
      />

      <Link
        href={`/products/${product.id}`}
        onClick={onLinkClick}
        className="flex w-full flex-col outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span className="flex flex-col items-start px-6 pt-7 sm:px-7">
          <span className="font-mono text-[10.5px] font-semibold tracking-[0.18em] text-ink-muted uppercase [&:lang(th)]:tracking-[0.04em]">
            {product.brand ?? DEFAULT_BRAND} · {tc(`${product.category}.nav`)}
          </span>
          <span className="mt-2 font-display text-2xl leading-tight font-extrabold tracking-tight text-content sm:text-[1.7rem]">
            {label}
          </span>
          <span className="mt-2 line-clamp-2 min-h-[2.7em] text-[14px] leading-snug text-ink-muted">
            {product.tagline[locale]}
          </span>
          {showsCondition(product.conditions) && (
            <ConditionLine conditions={product.conditions} className="mt-3" />
          )}
        </span>

        {/* the robot: its cut-out on the tile, or its clip while hovered */}
        <span className="relative mx-6 mt-4 block aspect-[4/3] overflow-hidden sm:mx-7">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={label}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-contain p-1 transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.04] motion-reduce:transform-none"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center p-6">
              <RobotIllustration variant={product.variant} className="h-full w-auto" />
            </span>
          )}
          {hoverVideo && (
            <video
              ref={videoRef}
              src={hoverVideo}
              muted
              loop
              playsInline
              preload="none"
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 ${
                active ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
          {product.preorder && (
            <span className="absolute top-0 left-0 bg-forest-950 px-2.5 py-1.5 font-mono text-[10.5px] font-semibold tracking-wider text-white uppercase">
              {t("preorder")}
            </span>
          )}
        </span>

        {/* Key figures — the at-a-glance comparison between models, split by
            hairlines. Left out when a product has none, rather than leaving
            an empty row. */}
        {specs.length > 0 && (
          <span className="mx-6 mt-5 grid grid-cols-3 sm:mx-7">
            {specs.map((key, i) => (
              <span
                key={key}
                className={`flex min-w-0 flex-col gap-1 ${i > 0 ? "border-l border-forest-100 pl-3 dark:border-forest-700" : "pr-3"}`}
              >
                <span className="font-mono text-[13.5px] leading-tight font-bold [overflow-wrap:anywhere] text-content tabular-nums">
                  {product.specs[key]}
                </span>
                <span className="line-clamp-2 text-[11px] leading-tight text-ink-muted">
                  {td(`specLabels.${key}`)}
                </span>
              </span>
            ))}
          </span>
        )}

        <span className="mt-auto flex items-center justify-between gap-3 px-6 pt-6 pb-6 sm:px-7">
          <PriceOrQuote
            amount={product.price}
            className="font-mono text-[15px] font-bold text-content tabular-nums"
            quoteClassName="text-[14px] font-semibold text-content"
          />
          <span className="inline-flex shrink-0 items-center gap-1.5 text-[14px] font-bold text-accent-600">
            {t("learnMore")}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none"
              aria-hidden="true"
            />
          </span>
        </span>
      </Link>
    </motion.article>
  );
}

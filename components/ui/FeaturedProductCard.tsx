"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import RobotIllustration from "@/components/ui/RobotIllustration";
import { type Locale, type Product, type SpecKey } from "@/data/products";
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
 * Large, image-forward product card for the home carousel (Mammotion-style):
 * a full-bleed product photo with the name, tagline, a "Learn More" button and
 * the price laid over it. On hover it plays the product's clip, if one is set.
 *
 * The plainer top-image + details card (components/ui/ProductCard.tsx) is still
 * used on the shop, search, and related-products grids.
 */

/**
 * TEMPORARY demo clips (mirrors ProductCard) so the hover effect shows before
 * real per-product videos are set on `product.hoverVideo`. Keyed by variant.
 */
const DEMO_HOVER_VIDEO: Partial<Record<Product["variant"], string>> = {
  luba: "/videos/hero-banner-luba3.mp4",
  mini: "/videos/hero-luba-mini.mp4",
};

export default function FeaturedProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const t = useTranslations("products");
  const td = useTranslations("productDetail");
  const locale = useLocale() as Locale;
  const specs = CARD_SPECS.filter((key) => product.specs?.[key]).slice(
    0,
    MAX_CARD_SPECS
  );

  // Home card prefers a dedicated lifestyle photo; falls back to the product
  // render used everywhere else.
  const cardImage = product.homeImage ?? product.imageUrl;
  const hoverVideo = product.hoverVideo ?? DEMO_HOVER_VIDEO[product.variant];
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
  // second tap opens the product — so a tap isn't wasted on the preview.
  const onTouchStart = () => {
    touchedRef.current = true;
    wasActiveRef.current = active;
    if (!active) {
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
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: index * 0.09, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={playVideo}
      onMouseLeave={stopVideo}
      onFocus={playVideo}
      onBlur={stopVideo}
      onTouchStart={onTouchStart}
      className="group relative aspect-[4/5] w-[340px] shrink-0 snap-start overflow-hidden rounded-3xl border border-forest-100 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.4)] transition-shadow duration-300 hover:shadow-[0_28px_60px_-20px_rgba(0,0,0,0.5)] sm:w-[400px]"
    >
      <Link href={`/products/${product.id}`} onClick={onLinkClick} className="block h-full w-full">
        {/* full-bleed background: home photo (or product render), else the
            variant illustration */}
        {cardImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cardImage}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-forest via-forest-800 to-forest-950 p-10">
            <RobotIllustration variant={product.variant} className="h-full w-auto" />
          </span>
        )}

        {/* hover clip — cross-fades in over the photo; preload only on hover */}
        {hoverVideo && (
          <video
            ref={videoRef}
            src={hoverVideo}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100 ${
              active ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {/* legibility scrims: dark at the top (name/tagline/button) and the
            bottom (price) so white text reads over any photo */}
        <span
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-2/3 bg-gradient-to-b from-black/55 via-black/15 to-transparent"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-2/5 bg-gradient-to-t from-black/70 to-transparent"
          aria-hidden="true"
        />

        {product.preorder && (
          <span className="absolute right-4 top-4 z-10 rounded-full bg-forest-950 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-gold">
            {t("preorder")}
          </span>
        )}

        {/* overlaid content: name + tagline + CTA at the top, price at the base */}
        <span className="absolute inset-0 z-[2] flex flex-col justify-between p-6 sm:p-7">
          <span className="flex flex-col items-start gap-3">
            <span className="font-display text-2xl font-extrabold leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:text-3xl">
              {product.name}
            </span>
            <span className="max-w-[88%] text-[13.5px] font-medium leading-snug text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)]">
              {product.tagline[locale]}
            </span>
            <span className="mt-1 inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-5 py-2.5 text-[13.5px] font-bold text-forest-950 shadow-[0_10px_26px_-10px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-105">
              {t("learnMore")}
              <ArrowRight className="h-4 w-4 shrink-0 text-forest-950" aria-hidden="true" />
            </span>
          </span>

          <span className="flex flex-col items-start gap-3.5">
            {/* Key specs — the at-a-glance comparison between models. Hidden
                entirely when a product has none, rather than leaving an empty
                strip: a card with no band reads as a different card, a card
                with a blank band reads as broken. */}
            {specs.length > 0 && (
              <span className="flex w-full flex-wrap gap-1.5">
                {specs.map((key) => (
                  <span
                    key={key}
                    className="flex min-w-0 flex-1 basis-[28%] flex-col gap-0.5 rounded-xl border border-white/15 bg-black/35 px-2.5 py-2 backdrop-blur-sm"
                  >
                    <span className="truncate font-mono text-[12.5px] font-bold leading-none text-white">
                      {product.specs[key]}
                    </span>
                    <span className="truncate text-[9.5px] font-medium leading-tight text-white/60">
                      {td(`specLabels.${key}`)}
                    </span>
                  </span>
                ))}
              </span>
            )}

            <PriceOrQuote
              amount={product.price}
              className="font-mono text-xl font-bold tabular-nums text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)] sm:text-2xl"
              quoteClassName="text-base font-bold text-gold drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)] sm:text-lg"
            />
          </span>
        </span>
      </Link>
    </motion.article>
  );
}

"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import RobotIllustration from "@/components/ui/RobotIllustration";
import MetaLine from "@/components/ui/MetaLine";
import Badge from "@/components/ui/Badge";
import PriceOrQuote from "@/components/ui/PriceOrQuote";
import { DEFAULT_BRAND, productLabel, type Locale, type Product, type SpecKey } from "@/data/products";
import { showsCondition } from "@/data/conditions";
import { siteConfig } from "@/data/siteConfig";
import { canOptimise } from "@/lib/media";

/**
 * Key figures shown on a card, best differentiator first; only the first
 * three a robot has. Specs, not `features`: short, and in the same unit on
 * every robot, so two cards can be read side by side.
 */
const CARD_SPECS: SpecKey[] = ["area", "slope", "runtime", "cuttingWidth", "filtration", "connectivity"];
const MAX_CARD_SPECS = 3;

/** The picture's slot sizes: one card in a rail, or one cell of the grid. */
const SIZES = {
  rail: "(min-width: 640px) 360px, 300px",
  grid: "(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw",
  dense: "(min-width: 1280px) 25vw, 50vw",
} as const;

/** A card shows the figure, not its gloss: "80% (38°)" → "80%". The full
 *  value is on the robot's page; in a ~70px column the bracket wrapped. */
const cardValue = (value: string) => value.replace(/\s*\([^)]*\)\s*$/, "");

/**
 * The one robot card, everywhere a robot is listed: the homepage rail, the
 * shop, a category, search results and "You may also like".
 *
 * Brand and category, the name, one line, the robot's cut-out and up to three
 * figures. The whole card is the link. No border, shadow, lift or zoom: on
 * hover the tile darkens a shade, and a robot with a clip plays it in the
 * picture's place (mouse only; a tap always opens the robot). A price line
 * appears only when the site shows prices.
 */
export default function RobotCard({
  product,
  layout = "grid",
  dense = false,
  displayName,
  displayTagline,
  className = "",
  headingAs: Heading = "h3",
}: {
  product: Product;
  layout?: "rail" | "grid";
  /** Two to a row on phones: below sm the card drops its line and figures
   *  and keeps name and picture (13 robots one per row ran to ~8,000px). */
  dense?: boolean;
  /** h3 under a section heading; h2 where the cards sit straight under the
   *  page's h1 (the shop grid), so the outline doesn't skip a level. */
  headingAs?: "h2" | "h3";
  /** Extra classes for the card, e.g. a rail on phones that is a grid cell from sm. */
  className?: string;
  /** Overrides the catalogue name, for a card that stands in for a group. */
  displayName?: string;
  displayTagline?: string;
}) {
  const t = useTranslations("products");
  const td = useTranslations("productDetail");
  const tc = useTranslations("categories");
  const tcond = useTranslations("condition");
  const locale = useLocale() as Locale;
  const specs = CARD_SPECS.filter((key) => product.specs?.[key]).slice(0, MAX_CARD_SPECS);
  const label = displayName ?? productLabel(product);

  const hoverVideo = product.hoverVideo;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  // The clip is a hover preview: only where a real pointer can hover, and not
  // for people who asked for less motion. A tap always opens the robot (it
  // used to play the clip first, so the priority mowers took two taps).
  const playVideo = () => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = videoRef.current;
    if (!el) return;
    setActive(true);
    el.play().catch(() => setActive(false));
  };
  const stopVideo = () => {
    setActive(false);
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  };

  const badges = [
    ...(product.preorder ? [{ key: "preorder", text: t("preorder"), solid: true }] : []),
    ...(showsCondition(product.conditions)
      ? product.conditions.map((c) => ({
          key: c,
          text: tcond(c === "new" ? "new" : "preOwned"),
          solid: false,
        }))
      : []),
  ];

  return (
    <article
      onMouseEnter={playVideo}
      onMouseLeave={stopVideo}
      onFocus={playVideo}
      onBlur={stopVideo}
      className={`group rounded-card bg-cloud transition-colors duration-150 hover:bg-forest-100/60 active:bg-forest-100 active:duration-0 dark:hover:bg-forest-800/60 dark:active:bg-forest-800 ${
        layout === "rail" ? "w-[300px] shrink-0 snap-start sm:w-[360px]" : ""
      } ${className}`}
    >
      <Link
        href={`/products/${product.id}`}
        className={`flex h-full flex-col rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          dense ? "p-4 sm:p-6" : "p-6"
        }`}
      >
        <MetaLine>
          {product.brand ?? DEFAULT_BRAND} · {tc(`${product.category}.nav`)}
        </MetaLine>
        <Heading
          className={`mt-1 font-display text-content ${dense ? "text-body font-semibold sm:text-heading" : "text-heading"}`}
        >
          {label}
        </Heading>
        <p className={`mt-2 line-clamp-2 min-h-[3em] text-small text-ink-muted ${dense ? "max-sm:hidden" : ""}`}>
          {displayTagline ?? product.tagline[locale]}
        </p>

        {/* the robot: its cut-out, or its clip while hovered */}
        <div className={`relative aspect-[4/3] overflow-hidden ${dense ? "mt-3 sm:mt-4" : "mt-4"}`}>
          {product.imageUrl ? (
            canOptimise(product.imageUrl) ? (
              <Image
                src={product.imageUrl}
                alt={label}
                fill
                sizes={dense ? SIZES.dense : SIZES[layout]}
                className="object-contain"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- any admin URL
              <img
                src={product.imageUrl}
                alt={label}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-contain"
              />
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <RobotIllustration variant={product.variant} className="h-full w-auto" />
            </div>
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
              // shown only while it actually plays: on a phone, or with reduced
              // motion, a hover state would otherwise uncover an empty frame
              className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                active ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </div>

        {/* under the picture, not above it: a badge above used to push this
            card's picture below its neighbours' */}
        {badges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <Badge key={b.key} tone={b.solid ? "solid" : "neutral"}>
                {b.text}
              </Badge>
            ))}
          </div>
        )}

        {/* pinned to the card's foot, so a row's figures line up whether or
            not a card has badges */}
        {specs.length > 0 && (
          <div className={`mt-auto pt-4 ${dense ? "max-sm:hidden" : ""}`}>
            <dl className="grid grid-cols-3 gap-3 border-t border-forest-100 pt-4">
              {specs.map((key) => (
                <div key={key} className="flex min-w-0 flex-col-reverse justify-end">
                  <dt className="mt-0.5 line-clamp-2 text-caption text-ink-muted">{td(`specLabels.${key}`)}</dt>
                  <dd className="text-body font-semibold [overflow-wrap:anywhere] text-content tabular-nums">
                    {cardValue(product.specs[key] ?? "")}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {siteConfig.showPrices && (
          <p className="mt-auto pt-4">
            <PriceOrQuote amount={product.price} className="text-body font-semibold text-content tabular-nums" />
          </p>
        )}
      </Link>
    </article>
  );
}

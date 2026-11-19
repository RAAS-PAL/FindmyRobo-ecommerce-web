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
} as const;

/**
 * The one robot card, everywhere a robot is listed: the homepage rail, the
 * shop, a category, search results and "You may also like".
 *
 * Brand and category, the name, one line, the robot's cut-out and up to three
 * figures. The whole card is the link. No border, shadow, lift or zoom: on
 * hover the tile darkens a shade, and a robot with a clip plays it in the
 * picture's place. On touch the first tap plays the clip, the second opens
 * the robot. A price line appears only when the site shows prices.
 */
export default function RobotCard({
  product,
  layout = "grid",
  displayName,
  displayTagline,
}: {
  product: Product;
  layout?: "rail" | "grid";
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
  // Touch has no hover: the first tap plays the clip, a second opens the robot.
  // A robot without a clip opens on the first tap.
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
      onTouchStart={onTouchStart}
      className={`group rounded-card bg-cloud transition-colors duration-150 hover:bg-forest-100/60 dark:hover:bg-forest-800/60 ${
        layout === "rail" ? "w-[300px] shrink-0 snap-start sm:w-[360px]" : ""
      }`}
    >
      <Link
        href={`/products/${product.id}`}
        onClick={onLinkClick}
        className="flex h-full flex-col rounded-card p-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <MetaLine>
          {product.brand ?? DEFAULT_BRAND} · {tc(`${product.category}.nav`)}
        </MetaLine>
        <h3 className="mt-1 font-display text-heading text-content">{label}</h3>
        <p className="mt-2 line-clamp-2 min-h-[3em] text-small text-ink-muted">
          {displayTagline ?? product.tagline[locale]}
        </p>
        {badges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {badges.map((b) => (
              <Badge key={b.key} tone={b.solid ? "solid" : "neutral"}>
                {b.text}
              </Badge>
            ))}
          </div>
        )}

        {/* the robot: its cut-out, or its clip while hovered */}
        <div className="relative mt-4 aspect-[4/3] overflow-hidden">
          {product.imageUrl ? (
            canOptimise(product.imageUrl) ? (
              <Image
                src={product.imageUrl}
                alt={label}
                fill
                sizes={SIZES[layout]}
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
              className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 ${
                active ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </div>

        {specs.length > 0 && (
          <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-forest-100 pt-4">
            {specs.map((key) => (
              <div key={key} className="flex min-w-0 flex-col-reverse">
                <dt className="mt-0.5 line-clamp-2 text-caption text-ink-muted">{td(`specLabels.${key}`)}</dt>
                <dd className="text-body font-semibold [overflow-wrap:anywhere] text-content tabular-nums">
                  {product.specs[key]}
                </dd>
              </div>
            ))}
          </dl>
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

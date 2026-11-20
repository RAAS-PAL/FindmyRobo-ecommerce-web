"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useQuote } from "@/components/quote/QuoteProvider";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import MetaLine from "@/components/ui/MetaLine";
import ProductVisual from "@/components/ui/ProductVisual";
import { conditionKind } from "@/data/conditions";
import { categoryHref } from "@/data/categories";
import { pick } from "@/data/siteContent";
import {
  productLabel,
  type LocalizedText,
  type PageBlock,
  type Product,
  type ShowcaseColor,
  type ShowcaseContent,
} from "@/data/products";

type PhotoFeature = Extract<PageBlock, { type: "feature" }> & { image: string };

/** A photo from Admin: files in the site go through next/image; other URLs
 *  (uploads, anywhere else) as a plain <img>, since next/image only takes
 *  hosts listed in next.config. */
function FillImage({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  // A section's "photo" may be a short clip (an .mp4 link in Admin): it
  // plays silently on a loop, like a moving photo. With reduced motion it
  // doesn't start. A `-web.mp4` clip takes the still beside it on S3
  // (`-poster.webp`) as its first frame.
  if (/\.mp4(\?|$)/i.test(src)) {
    const poster = /-web\.mp4$/i.test(src) ? src.replace(/-web\.mp4$/i, "-poster.webp") : undefined;
    return (
      <video
        src={src}
        poster={poster}
        aria-label={alt}
        muted
        loop
        playsInline
        preload="metadata"
        // started from an effect-free ref: autoplay only without reduced motion
        ref={(el) => {
          if (el && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            el.play().catch(() => {});
          }
        }}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }
  if (src.startsWith("/")) {
    return <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />;
}

/** A feature photo across the page column. */
function FeaturePhoto({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="mx-auto mt-10 max-w-7xl px-4 sm:mt-14 sm:px-6 lg:px-8">
      <div className="relative aspect-[16/9] overflow-hidden rounded-card bg-forest-950">
        <FillImage src={src} alt={alt} sizes="(min-width: 1280px) 1216px, 100vw" />
      </div>
    </div>
  );
}

/** One body colour in the hero, named so the two can be told apart.
 */
function HeroColor({ color, alt, label }: { color: ShowcaseColor; alt: string; label: string }) {
  return (
    <figure className="flex min-w-0 flex-1 flex-col items-center">
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element -- any Admin URL */}
        <img
          src={color.image}
          alt={alt}
          fetchPriority="high"
          className="h-[min(42svh,22rem)] w-auto max-w-full object-contain sm:h-[min(52svh,28rem)] lg:h-[min(64svh,34rem)]"
        />
      </div>
      <figcaption className="mt-3 flex items-center gap-2 text-caption font-semibold text-white/80">
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 rounded-full border border-white/50"
          style={{ backgroundColor: color.swatch }}
        />
        {label}
      </figcaption>
    </figure>
  );
}

/**
 * The full-screen product page, DJI-style, for a product with "Full-screen
 * page" content (ProductPage.showcase, Admin → Products): a dark studio hero
 * with the robot, its key figures, one full-width photo per feature section,
 * the spec table and a closing quote call. Quote-only, like the rest of the
 * store: every button opens the quote form with the product named.
 *
 * `afterFeatures` / `afterSpecs` carry the product's other page sections
 * (non-photo sections, what's in the box, FAQ), rendered on the server.
 * `models` (this product among them) are the versions of the robot on show,
 * for the switch under its name.
 */
export default function ShowcasePage({
  product,
  showcase,
  models,
  afterFeatures,
  afterSpecs,
}: {
  product: Product;
  showcase: ShowcaseContent;
  models?: { id: string; name: string }[];
  afterFeatures?: React.ReactNode;
  afterSpecs?: React.ReactNode;
}) {
  const t = useTranslations("modelPage");
  const tc = useTranslations("categories");
  const tcond = useTranslations("condition");
  const locale = useLocale();
  const { openQuote } = useQuote();
  const quote = () => openQuote({ productId: product.id });
  const text = (v: LocalizedText) => pick(v, locale);

  const label = productLabel(product);
  // "Gausium Phantas": brand plain, model name in the accent gradient
  const brandPart = label !== product.name ? label.slice(0, label.length - product.name.length).trim() : "";
  const heroImage = showcase.heroImage ?? product.imageUrl;
  const colors = showcase.colors && showcase.colors.length > 1 ? showcase.colors : undefined;
  const features = (product.page?.blocks ?? []).filter(
    (b): b is PhotoFeature => b.type === "feature" && !!b.image
  );

  const kind = conditionKind(product.conditions);
  const conditionValue =
    kind === "either" ? tcond("either") : kind === "new" ? tcond("new") : kind === "pre-owned" ? tcond("preOwned") : null;
  const specGroups = product.page?.specGroups ?? [];
  // condition as the table's first row, so it's read before any figure
  const specs =
    conditionValue && specGroups.length > 0
      ? specGroups.map((group, i) =>
          i === 0
            ? {
                ...group,
                rows: [
                  {
                    label: { en: tcond("label"), th: tcond("label") },
                    value: { en: conditionValue, th: conditionValue },
                  },
                  ...group.rows,
                ],
              }
            : group
        )
      : specGroups;

  return (
    <main>
      {/* ---- hero: the product on the dark studio set ---- */}
      <section className="relative -mt-[var(--nav-h)] overflow-hidden bg-forest-950 pt-[var(--nav-h)] text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-forest-950"
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-4 pt-8 pb-14 sm:px-6 lg:min-h-[calc(100svh-var(--nav-h))] lg:max-h-[56rem] lg:grid-cols-[1fr_1.1fr] lg:gap-10 lg:px-8 lg:py-12">
          <div className="order-2 lg:order-1">
            <nav
              aria-label={t("breadcrumb")}
              className="mb-6 flex items-center gap-1.5 text-caption text-white/60"
            >
              <Link href="/shop" className="hover:text-white">
                {t("shop")}
              </Link>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              <Link href={categoryHref(product.category)} className="hover:text-white">
                {tc(`${product.category}.name`)}
              </Link>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="text-white/85">{product.name}</span>
            </nav>
            <MetaLine onPhoto>{text(showcase.eyebrow)}</MetaLine>
            {/* the brand and the model in one colour */}
            <h1 className="mt-2 font-display text-display">
              {brandPart && <>{brandPart} </>}
              <span className="whitespace-nowrap">{product.name}</span>
            </h1>
            {product.conditions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {product.conditions.map((c) => (
                  <Badge key={c} tone="onPhoto">
                    {tcond(c === "new" ? "new" : "preOwned")}
                  </Badge>
                ))}
              </div>
            )}
            {/* other versions of the robot: one page each, switched here */}
            {models && (
              <nav
                aria-label={t("models")}
                className="mt-5 inline-flex flex-wrap gap-1 rounded-control border border-white/15 p-1"
              >
                {models.map((model) =>
                  model.id === product.id ? (
                    <span
                      key={model.id}
                      aria-current="page"
                      className="inline-flex min-h-10 items-center rounded-control bg-white px-4 text-small font-semibold text-forest-950"
                    >
                      {model.name}
                    </span>
                  ) : (
                    <Link
                      key={model.id}
                      href={`/products/${model.id}`}
                      className="inline-flex min-h-10 items-center rounded-control px-4 text-small font-medium text-white/75 transition-colors duration-150 hover:bg-white/10 hover:text-white"
                    >
                      {model.name}
                    </Link>
                  )
                )}
              </nav>
            )}
            <p className="mt-5 max-w-md text-lead text-white/80">
              {text(product.tagline)}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={quote}>
                {t("getQuote")}
              </Button>
              <Button href="/products/request-a-demo" size="lg" variant="onPhoto">
                {t("bookDemo")}
              </Button>
            </div>
          </div>
          <div
            className={`relative order-1 mx-auto w-full lg:order-2 lg:max-w-none ${
              colors ? "max-w-xl" : "max-w-md"
            }`}
          >
            <div className="relative">
              {colors ? (
                <div className="flex items-end justify-center gap-1 sm:gap-4">
                  {colors.map((color) => (
                    <HeroColor
                      key={color.image}
                      color={color}
                      alt={`${label}, ${text(color.label)}`}
                      label={text(color.label)}
                    />
                  ))}
                </div>
              ) : (
                <div>
                  {heroImage ? (
                    // eslint-disable-next-line @next/next/no-img-element -- any Admin URL
                    <img
                      src={heroImage}
                      alt={label}
                      fetchPriority="high"
                      // capped like the colour shots: a tall photo stays in the
                      // hero instead of growing to the column's full width
                      className="h-auto max-h-[min(42svh,22rem)] w-full object-contain sm:max-h-[min(52svh,28rem)] lg:max-h-[min(64svh,34rem)]"
                    />
                  ) : (
                    <ProductVisual product={product} className="aspect-[4/3] h-auto w-full" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---- key figures ---- */}
        {showcase.figures.length > 0 && (
          <div className="relative border-t border-white/10">
            <dl className="mx-auto grid max-w-7xl grid-cols-2 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
              {showcase.figures.map((figure, i) => (
                <div
                  key={`${i}-${figure.value}`}
                  className={`py-7 lg:py-9 ${i % 2 === 1 ? "pl-5 lg:pl-8" : "lg:pl-8"} ${
                    i > 0 ? "lg:border-l lg:border-white/10" : "lg:pl-0"
                  } ${i === 1 ? "border-l border-white/10" : ""} ${i === 3 ? "border-l border-white/10" : ""}`}
                >
                  <dt className="order-2 mt-1.5 text-small text-white/60">{text(figure.label)}</dt>
                  <dd className="font-display text-title">
                    {figure.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </section>

      {/* ---- one photo per feature ---- */}
      {features.map((feature, i) => (
        <section key={`${i}-${feature.image}`} className="bg-surface pt-20 sm:pt-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {feature.eyebrow && (
              <MetaLine>{text(feature.eyebrow)}</MetaLine>
            )}
            <h2 className="mt-2 max-w-2xl font-display text-title text-content">
              {text(feature.heading)}
            </h2>
            <p className="mt-4 max-w-2xl text-lead text-ink-muted">
              {text(feature.body)}
            </p>
          </div>
          <FeaturePhoto src={feature.image} alt={`${label}: ${text(feature.heading)}`} />
        </section>
      ))}

      {afterFeatures && (
        <div className="bg-surface pt-20 sm:pt-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{afterFeatures}</div>
        </div>
      )}

      {/* ---- specifications ---- */}
      {specs.length > 0 && (
        <section id="specs" className="bg-surface py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-title text-content">
              {t("specsHeading")}
            </h2>
            <div className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">
              {specs.map((group, i) => (
                <div key={`${i}-${group.title.en}`}>
                  <h3 className="border-b border-forest-300 pb-2 font-display text-heading text-content">
                    {text(group.title)}
                  </h3>
                  <dl>
                    {group.rows.map((row, j) => (
                      <div
                        key={`${j}-${row.label.en}`}
                        className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-4 border-b border-forest-100 py-3 text-small"
                      >
                        <dt className="text-ink-muted">{text(row.label)}</dt>
                        <dd className="font-semibold text-content">{text(row.value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {afterSpecs && (
        <div className="bg-surface pb-20 sm:pb-28">
          <div className="mx-auto max-w-7xl space-y-16 px-4 sm:space-y-20 sm:px-6 lg:px-8">{afterSpecs}</div>
        </div>
      )}

      {/* ---- closing call ---- */}
      <section className="bg-forest-950 py-16 text-white sm:py-24">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <h2 className="font-display text-title">{t("ctaHeading", { name: product.name })}</h2>
            <p className="mt-3 text-lead text-white/75">{t("ctaBody")}</p>
          </div>
          <Button size="lg" onClick={quote}>
            {t("getQuote")}
          </Button>
        </div>
      </section>
    </main>
  );
}

"use client";

import { useRef } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  motion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { ArrowUpRight, Calendar, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useQuote } from "@/components/quote/QuoteProvider";
import FadeIn from "@/components/ui/FadeIn";
import ConditionLine from "@/components/ui/ConditionLine";
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

const EASE = [0.16, 1, 0.3, 1] as const;

/** Hero copy: each line slides in after the one above it. */
const heroCopy: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.09, delayChildren: 0.25 } },
};
const heroLine: Variants = {
  hidden: { opacity: 0, y: 22 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

type PhotoFeature = Extract<PageBlock, { type: "feature" }> & { image: string };

/** A photo from Admin: files in the site go through next/image; other URLs
 *  (uploads, anywhere else) as a plain <img>, since next/image only takes
 *  hosts listed in next.config. */
function FillImage({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  if (src.startsWith("/")) {
    return <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />;
}

/**
 * A feature photo that opens out as it scrolls into view, DJI-style: it
 * starts as a smaller rounded window and widens to the full column while the
 * image inside settles from a slight zoom. Tied to scroll position, so it
 * plays forwards and backwards; static with reduced motion (CSS below).
 */
function FeaturePhoto({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const inset = useTransform(scrollYProgress, [0, 1], [12, 0]);
  const clipPath = useTransform(
    inset,
    (v) => `inset(${v}% ${v}% ${v}% ${v}% round 1rem)`,
  );
  const scale = useTransform(scrollYProgress, [0, 1], [1.18, 1]);
  return (
    <div
      ref={ref}
      className="mx-auto mt-10 max-w-7xl px-3 sm:mt-14 sm:px-6 lg:px-8"
    >
      <motion.div
        style={{ clipPath }}
        // reduced motion: CSS drops the scroll-bound clip and zoom (framer's
        // reducedMotion setting doesn't reach values bound to scroll)
        className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-forest-950 motion-reduce:[clip-path:none]!"
      >
        <motion.div
          style={{ scale }}
          className="absolute inset-0 motion-reduce:[transform:none]!"
        >
          <FillImage src={src} alt={alt} sizes="(min-width: 1280px) 1216px, 100vw" />
        </motion.div>
      </motion.div>
    </div>
  );
}

/** One body colour in the hero, named so the two can be told apart.
 *  Only the photo floats. The name stays put: a looping translate on small
 *  tracked type repaints the letters on fractional pixels and they stutter. */
function HeroColor({ color, alt, label }: { color: ShowcaseColor; alt: string; label: string }) {
  return (
    <figure className="flex min-w-0 flex-1 flex-col items-center">
      <div className="animate-hero-float">
        {/* eslint-disable-next-line @next/next/no-img-element -- any Admin URL */}
        <img
          src={color.image}
          alt={alt}
          fetchPriority="high"
          className="h-[min(42svh,22rem)] w-auto max-w-full object-contain sm:h-[min(52svh,28rem)] lg:h-[min(64svh,34rem)]"
        />
      </div>
      <figcaption className="mt-3 flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.18em] text-white/80 uppercase [&:lang(th)]:tracking-[0.04em]">
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
 */
export default function ShowcasePage({
  product,
  showcase,
  afterFeatures,
  afterSpecs,
}: {
  product: Product;
  showcase: ShowcaseContent;
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
      <section className="relative overflow-hidden bg-[#0b0d10] text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(70%_80%_at_68%_45%,#1d2230_0%,#12151c_50%,#0b0d10_100%)]"
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-4 pt-8 pb-14 sm:px-6 lg:min-h-[calc(100svh-69px)] lg:max-h-[56rem] lg:grid-cols-[1fr_1.1fr] lg:gap-10 lg:px-8 lg:py-12">
          <motion.div
            className="order-2 lg:order-1"
            variants={heroCopy}
            initial="hidden"
            animate="shown"
          >
            <motion.nav
              variants={heroLine}
              aria-label={t("breadcrumb")}
              className="mb-6 flex items-center gap-1.5 text-[12.5px] text-white/60"
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
            </motion.nav>
            <motion.p
              variants={heroLine}
              className="flex items-center gap-2.5 font-mono text-[11.5px] font-semibold tracking-[0.28em] text-white/80 uppercase [&:lang(th)]:tracking-[0.06em]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              {text(showcase.eyebrow)}
            </motion.p>
            <motion.h1
              variants={heroLine}
              className="mt-3 font-display text-5xl leading-[1.02] font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
            >
              {brandPart && <>{brandPart} </>}
              <span className="text-accent-gradient whitespace-nowrap">{product.name}</span>
            </motion.h1>
            {product.conditions.length > 0 && (
              <motion.div variants={heroLine} className="mt-4">
                <ConditionLine conditions={product.conditions} tone="dark" />
              </motion.div>
            )}
            <motion.p
              variants={heroLine}
              className="mt-5 max-w-md text-[16px] leading-relaxed text-white/80 sm:text-lg"
            >
              {text(product.tagline)}
            </motion.p>
            <motion.div variants={heroLine} className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={quote}
                className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-accent-gradient px-7 text-[15px] font-bold"
              >
                {t("getQuote")}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <Link
                href="/products/request-a-demo"
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/35 px-6 text-[15px] font-semibold text-white transition-colors hover:border-white"
              >
                <Calendar className="h-4 w-4" aria-hidden="true" />
                {t("bookDemo")}
              </Link>
            </motion.div>
          </motion.div>
          <div
            className={`relative order-1 mx-auto w-full lg:order-2 lg:max-w-none ${
              colors ? "max-w-xl" : "max-w-md"
            }`}
          >
            {/* light blooming behind the robot as it arrives */}
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.6, ease: EASE }}
              className="absolute inset-[8%] rounded-full bg-[radial-gradient(closest-side,rgb(var(--accent-rgb)/0.28),rgb(var(--accent-rgb)/0.08)_55%,transparent)] blur-2xl"
            />
            {/* arrives rising into place; the photo then floats on its own */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.1, ease: EASE }}
              className="relative"
            >
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
                <div className="animate-hero-float">
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
            </motion.div>
          </div>
        </div>

        {/* ---- key figures ---- */}
        {showcase.figures.length > 0 && (
          <div className="relative border-t border-white/10">
            {/* a blue line drawing across as the figures come in */}
            <motion.span
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
              className="absolute -top-px left-0 h-px w-full origin-left bg-gradient-to-r from-transparent via-accent to-transparent"
            />
            <dl className="mx-auto grid max-w-7xl grid-cols-2 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
              {showcase.figures.map((figure, i) => (
                <motion.div
                  key={`${i}-${figure.value}`}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: EASE }}
                  className={`py-7 lg:py-9 ${i % 2 === 1 ? "pl-5 lg:pl-8" : "lg:pl-8"} ${
                    i > 0 ? "lg:border-l lg:border-white/10" : "lg:pl-0"
                  } ${i === 1 ? "border-l border-white/10" : ""} ${i === 3 ? "border-l border-white/10" : ""}`}
                >
                  <dt className="order-2 mt-1.5 text-[13px] text-white/60">{text(figure.label)}</dt>
                  <dd className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
                    {figure.value}
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>
        )}
      </section>

      {/* ---- one photo per feature ---- */}
      {features.map((feature, i) => (
        <section key={`${i}-${feature.image}`} className="bg-surface pt-20 sm:pt-28">
          <FadeIn className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            {feature.eyebrow && (
              <p className="font-mono text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase [&:lang(th)]:tracking-[0.06em]">
                {text(feature.eyebrow)}
              </p>
            )}
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-content sm:text-5xl">
              {text(feature.heading)}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-muted sm:text-lg">
              {text(feature.body)}
            </p>
          </FadeIn>
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
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-content sm:text-5xl">
              {t("specsHeading")}
            </h2>
            <div className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">
              {specs.map((group, i) => (
                <motion.div
                  key={`${i}-${group.title.en}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: (i % 2) * 0.12, ease: EASE }}
                >
                  <h3 className="border-b-2 border-content pb-2 font-display text-lg font-bold text-content">
                    {text(group.title)}
                  </h3>
                  <dl>
                    {group.rows.map((row, j) => (
                      <div
                        key={`${j}-${row.label.en}`}
                        className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-4 border-b border-forest-100 py-3 text-[14px]"
                      >
                        <dt className="text-ink-muted">{text(row.label)}</dt>
                        <dd className="font-semibold text-content">{text(row.value)}</dd>
                      </div>
                    ))}
                  </dl>
                </motion.div>
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
      <section className="bg-[#0b0d10] py-20 text-center text-white sm:py-24">
        <FadeIn className="mx-auto max-w-xl px-4">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("ctaHeading", { name: product.name })}
          </h2>
          <p className="mt-4 text-white/75">{t("ctaBody")}</p>
          <button
            type="button"
            onClick={quote}
            className="mt-8 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-accent-gradient px-8 text-[15px] font-bold"
          >
            {t("getQuote")}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </FadeIn>
      </section>
    </main>
  );
}

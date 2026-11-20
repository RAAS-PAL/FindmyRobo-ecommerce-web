"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSiteContent } from "@/components/SiteContentProvider";
import { useProducts } from "@/components/ProductsProvider";
import { useQuote } from "@/components/quote/QuoteProvider";
import { pick } from "@/data/siteContent";
import { heroSlides, onShow } from "@/data/homeShowcase";
import { DEFAULT_BRAND, SERVICE_CATEGORY } from "@/data/products";
import Button from "@/components/ui/Button";
import MetaLine from "@/components/ui/MetaLine";
import TextLink from "@/components/ui/TextLink";
import { categoryTabClass } from "@/components/ui/CategoryTabs";
import { FADE } from "@/lib/motion";

/**
 * Homepage hero (2026-11-20): a calm, light band. The copy on the left (a
 * brand line, the headline, one line, Get a quote and Learn more); on the
 * right a real photo of the robot at a customer's site with the place named
 * under it (or the family's cut-out where there is no such photo yet); the
 * families as tabs along the bottom, then the brands on sale. No generated
 * scene photo. Nothing moves on its own: copy and
 * robot cross-fade (opacity only) when a tab is pressed.
 *
 * The first slide's copy is the CMS hero headline (Admin → Content →
 * Homepage). A family whose robots are hidden in Admin has no tab (onShow).
 * While the hero (data-hero-quote) is on screen the navbar's own Get a quote
 * folds away, so there is one way in at a time.
 */
export default function HeroSection() {
  const t = useTranslations("showcase");
  const locale = useLocale();
  const { home } = useSiteContent();
  const { products } = useProducts();
  const { openQuote } = useQuote();
  const slides = useMemo(
    () => onShow(heroSlides, products).filter((slide) => slide.cutout),
    [products]
  );
  const brands = useMemo(
    () => [
      ...new Set(
        products.filter((p) => p.category !== SERVICE_CATEGORY).map((p) => p.brand ?? DEFAULT_BRAND)
      ),
    ],
    [products]
  );
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const slide = slides[index % slides.length];

  const headline = slide.headline ? pick(slide.headline, locale) : pick(home.heroHeadline, locale);
  const accent = slide.accent ? pick(slide.accent, locale) : pick(home.heroAccent, locale);
  const sub = slide.sub ? pick(slide.sub, locale) : pick(home.heroSub, locale);
  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: reduceMotion ? { duration: 0 } : FADE,
  };

  return (
    <section aria-label={t("slidesLabel")} className="-mt-[var(--nav-h)] bg-cloud pt-[var(--nav-h)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* data-hero-quote on this stable box, not on the button (each slide
            mounts a new button, which the navbar's observer would lose) */}
        <div data-hero-quote="" className="grid items-center gap-8 pt-10 pb-8 sm:pt-14 lg:min-h-[min(calc(100svh-var(--nav-h)-4.5rem),44rem)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12 lg:py-16">
          {/* copy */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={slide.id} {...fade} className="max-w-2xl">
              <MetaLine>{pick(slide.eyebrow, locale)}</MetaLine>
              {/* one slide shows at a time, so there is always exactly one h1 */}
              <h1 className="mt-3 font-display text-display text-content">
                {headline} <span className="sm:block">{accent}</span>
              </h1>
              <p className="mt-5 text-lead text-ink-muted">{sub}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  onClick={() => openQuote({ interest: slide.interest, productId: slide.productId })}
                >
                  {t("getQuote")}
                </Button>
                <Button href={slide.href} size="lg" variant="secondary">
                  {t("learnMore")}
                </Button>
              </div>
              <p className="mt-6 flex flex-wrap items-center gap-x-1.5 text-small text-ink-muted">
                {t("finderPrompt")}
                <TextLink href="/recommend">{t("finderLink")}</TextLink>
              </p>
            </motion.div>
          </AnimatePresence>

          {/* A real photo of the robot at a customer's site, with the place
              named under it; a family without one shows its cut-out. */}
          <div className="relative w-full">
            <AnimatePresence mode="wait" initial={false}>
              {slide.sitePhoto ? (
                <motion.figure key={slide.id} {...fade}>
                  <div className="relative aspect-[5/3] overflow-hidden rounded-card bg-forest-100">
                    <Image
                      src={slide.sitePhoto.src}
                      alt={pick(slide.sitePhoto.caption, locale)}
                      fill
                      priority={index === 0}
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mt-3 text-small text-ink-muted">
                    {pick(slide.sitePhoto.caption, locale)}
                  </figcaption>
                </motion.figure>
              ) : (
                <motion.div key={slide.id} {...fade} className="relative aspect-[5/3]">
                  <Image
                    src={slide.cutout!.src}
                    alt={pick(slide.tab, locale)}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-contain"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* the families, in the site's tab row */}
        {slides.length > 1 && (
          <div
            role="tablist"
            aria-label={t("slidesLabel")}
            className="no-scrollbar flex gap-6 overflow-x-auto border-b border-forest-100 dark:border-forest-700"
          >
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={t("showSlide", { name: pick(s.tab, locale) })}
                onClick={() => setIndex(i)}
                className={categoryTabClass(i === index)}
              >
                {pick(s.tab, locale)}
              </button>
            ))}
          </div>
        )}

        {/* the brands on sale, from the robots on show: names, not adjectives */}
        {brands.length > 1 && (
          <p className="py-5 text-small text-ink-muted">
            {t("brandsLabel")} <span className="font-medium text-content">{brands.join(" · ")}</span>
          </p>
        )}
      </div>
    </section>
  );
}

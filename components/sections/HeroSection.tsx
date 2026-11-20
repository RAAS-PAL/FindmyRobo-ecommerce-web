"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useSiteContent } from "@/components/SiteContentProvider";
import { pick } from "@/data/siteContent";
import { heroSlides, onShow } from "@/data/homeShowcase";
import { useProducts } from "@/components/ProductsProvider";
import QuoteStrip from "@/components/quote/QuoteStrip";
import Button from "@/components/ui/Button";
import MetaLine from "@/components/ui/MetaLine";
import { FADE } from "@/lib/motion";

/**
 * Homepage hero (2026-10-29, after dobot-robots.com): one robot family at a
 * time as a full-width photo of the robots at work (the owner's generated
 * scenes, data/homeShowcase.ts `image`), the headline over the photo's calm
 * top-left, and tabs along its bottom edge to switch families. Nothing
 * moves on its own: photo and copy cross-fade (opacity only) when a tab is
 * pressed.
 *
 * Under the photo, a consultation card with an inline two-step quote form,
 * the robot finder, the three promises and LINE.
 *
 * The first slide's copy is the CMS hero headline, so Admin → Content →
 * Homepage still sets the site's lead message. A family whose robots are
 * hidden in Admin, or which has no photo yet, has no tab (onShow).
 *
 * Phones: the photo with its tabs on top, the copy below it on the page.
 */
export default function HeroSection() {
  const t = useTranslations("showcase");
  const locale = useLocale();
  const { home } = useSiteContent();
  const { products } = useProducts();
  const slides = useMemo(
    () => onShow(heroSlides, products).filter((slide) => slide.image),
    [products]
  );
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const slide = slides[index % slides.length];

  const headline = slide.headline ? pick(slide.headline, locale) : pick(home.heroHeadline, locale);
  const accent = slide.accent ? pick(slide.accent, locale) : pick(home.heroAccent, locale);
  const sub = slide.sub ? pick(slide.sub, locale) : pick(home.heroSub, locale);
  const tabName = pick(slide.tab, locale);

  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: reduceMotion ? { duration: 0 } : FADE,
  };

  return (
    <section aria-label={t("slidesLabel")} className="bg-surface">
      {/* ---- the photo: runs up under the navbar (-mt / pt = its height) ---- */}
      <div className="relative -mt-[var(--nav-h)] pt-[var(--nav-h)] lg:h-[min(calc(100svh-4rem),56rem)] lg:min-h-[36rem] lg:bg-forest-950">
        <div className="relative aspect-[4/3] overflow-hidden bg-forest-950 sm:aspect-[16/9] lg:absolute lg:inset-0 lg:aspect-auto">
          <AnimatePresence initial={false}>
            <motion.div
              key={slide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduceMotion ? { duration: 0 } : FADE}
              className="absolute inset-0"
            >
              <Image
                src={slide.image!}
                alt={tabName}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: slide.focus ?? "50% 50%" }}
              />
            </motion.div>
          </AnimatePresence>
          {/* shade for the copy (lg) and the tabs: dark at the top-left and
              along the bottom edge, clear over the robots */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgb(7_10_16/0.7),transparent_28%)] lg:bg-[linear-gradient(to_top,rgb(7_10_16/0.7),transparent_24%),linear-gradient(100deg,rgb(7_10_16/0.72)_0%,rgb(7_10_16/0.45)_32%,transparent_58%)]"
          />
        </div>

        {/* ---- copy: on the photo from lg, under it on phones ---- */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-7 sm:px-6 lg:absolute lg:inset-x-0 lg:top-[calc(var(--nav-h)+3.5rem)] lg:px-8 lg:pt-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={slide.id} {...fade} className="max-w-xl">
              <MetaLine className="lg:text-white/80">{pick(slide.eyebrow, locale)}</MetaLine>
              {/* one slide shows at a time, so there is always exactly one
                  h1 — the server renders the first (the CMS headline) */}
              {/* one colour: the two lines are one sentence, not a slogan
                  with a highlighted half */}
              <h1 className="mt-3 font-display text-display text-content lg:text-white">
                {headline} <span className="sm:block">{accent}</span>
              </h1>
              <p className="mt-5 max-w-xl text-lead text-ink-muted lg:text-white/85">{sub}</p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button href={slide.href} size="lg">
                  {t("learnMore")}
                </Button>
                {slide.interest === "lawn-mowing" && (
                  <Button
                    href="/products/request-a-demo"
                    size="lg"
                    variant="secondary"
                    className="lg:border-white/50 lg:text-white lg:hover:border-white lg:hover:bg-white/10"
                  >
                    {t("bookDemo")}
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ---- tabs along the photo's bottom edge ---- */}
        {slides.length > 1 && (
          <div className="absolute inset-x-0 bottom-0 z-10 hidden lg:block">
            <HeroTabs slides={slides} index={index} onPick={setIndex} />
          </div>
        )}
      </div>

      {/* phones and tablets: the tabs under the copy */}
      {slides.length > 1 && (
        <div className="lg:hidden">
          <HeroTabs slides={slides} index={index} onPick={setIndex} onPage />
        </div>
      )}

      {/* The quote card owns the finder, support promises and LINE alternative. */}
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-10 sm:px-6 lg:px-8 lg:pt-10">
        <QuoteStrip interest={slide.interest} productId={slide.productId} />
      </div>
    </section>
  );
}

/**
 * The families as tabs: the family's name and a line along the top (bottom
 * on phones) on the one on show. No numbers. White on the photo's shaded
 * bottom edge from lg; on the page below the copy on phones (`onPage`).
 */
function HeroTabs({
  slides,
  index,
  onPick,
  onPage = false,
}: {
  slides: typeof heroSlides;
  index: number;
  onPick: (i: number) => void;
  onPage?: boolean;
}) {
  const t = useTranslations("showcase");
  const locale = useLocale();
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div
        role="tablist"
        aria-label={t("slidesLabel")}
        className={`no-scrollbar flex overflow-x-auto ${onPage ? "mt-8 border-b border-forest-100 dark:border-forest-700" : ""}`}
      >
        {slides.map((s, i) => {
          const active = i === index;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={t("showSlide", { name: pick(s.tab, locale) })}
              onClick={() => onPick(i)}
              className={`group relative flex cursor-pointer text-left font-medium transition-colors duration-150 ${
                onPage
                  ? "min-h-14 min-w-0 flex-1 items-center py-3 pr-3 text-small leading-snug sm:flex-none sm:pr-8"
                  : "min-h-16 min-w-[12rem] shrink-0 items-center pr-8 text-small whitespace-nowrap"
              } ${
                onPage
                  ? active
                    ? "text-content"
                    : "text-ink-muted hover:text-content"
                  : active
                    ? "text-white"
                    : "text-white/65 hover:text-white"
              }`}
            >
              {/* the line: full in the accent on the one on show */}
              <span
                aria-hidden="true"
                className={`absolute inset-x-0 ${onPage ? "bottom-0" : "top-0"} h-0.5 transition-colors duration-150 ${
                  active ? (onPage ? "bg-accent" : "bg-white") : onPage ? "bg-transparent" : "bg-white/25 group-hover:bg-white/50"
                }`}
              />
              {pick(s.tab, locale)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

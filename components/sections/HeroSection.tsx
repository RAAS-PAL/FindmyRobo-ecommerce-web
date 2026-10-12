"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Calendar, Check } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useSiteContent } from "@/components/SiteContentProvider";
import { pick } from "@/data/siteContent";
import { heroSlides, onShow } from "@/data/homeShowcase";
import { useProducts } from "@/components/ProductsProvider";
import QuoteStrip from "@/components/quote/QuoteStrip";
import LineChatButton from "@/components/quote/LineChatButton";

/** Why buy here rather than import — the About page's approved promises, shortened. */
const PROMISES = ["warranty", "install", "aftersales"] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Homepage hero ("showroom", 2026-10-12): one robot family at a time on a lit
 * canvas (.hero-canvas) — copy on the left, the robot cut-out large on the
 * right standing on a floor shadow — with the quote strip under the copy and
 * a row of chips under both to switch families. Nothing moves on its own:
 * the robot rises into place once, and changes only when a chip is clicked.
 *
 * The first slide's copy is the CMS hero headline, so Admin → Content →
 * Homepage still sets the site's lead message. A family whose robot is hidden
 * in Admin has no chip (data/homeShowcase.ts, onShow).
 *
 * Phones: robot first, then the copy, the strip and the chips, one column.
 */
export default function HeroSection() {
  const t = useTranslations("showcase");
  const tq = useTranslations("heroQuote");
  const locale = useLocale();
  const { home } = useSiteContent();
  const { products } = useProducts();
  const slides = useMemo(
    () => onShow(heroSlides, products).filter((slide) => slide.cutout),
    [products]
  );
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const slide = slides[index % slides.length];
  const cutout = slide.cutout!;

  const headline = slide.headline ? pick(slide.headline, locale) : pick(home.heroHeadline, locale);
  const accent = slide.accent ? pick(slide.accent, locale) : pick(home.heroAccent, locale);
  const sub = slide.sub ? pick(slide.sub, locale) : pick(home.heroSub, locale);
  const tabName = pick(slide.tab, locale);

  const fade = {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: reduceMotion ? 0 : 0.4, ease: EASE },
  };

  return (
    <section
      aria-label={t("slidesLabel")}
      // -mt / pt: the canvas runs up under the navbar, whose blue bar hangs
      // over its top edge (--nav-h = the bar's height). Not clipped: the open
      // quote card hangs below the strip, over whatever follows.
      className="hero-canvas relative -mt-[var(--nav-h)] pt-[var(--nav-h)]"
    >
      {/* From lg the copy and robot take the screen down to the chips, which
          sit at the bottom of the first screen (the 14rem is their band). */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 px-4 pt-4 sm:px-6 lg:min-h-[calc(100svh-var(--nav-h)-14rem)] lg:max-h-[40rem] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-8 lg:px-8 lg:pt-6">
        {/* ---- the robot, standing on its floor ---- */}
        <div className="relative order-1 lg:order-2">
          <div className="hero-floor" aria-hidden="true" />
          <div className="relative mx-auto aspect-[16/11] w-full max-w-[34rem] sm:max-w-[40rem] lg:max-w-none">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 36, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -14, scale: 0.98 }}
                transition={{ duration: reduceMotion ? 0 : 0.65, ease: EASE }}
                className="absolute inset-0"
              >
                <div className="animate-hero-float h-full w-full">
                  <Image
                    src={cutout.src}
                    alt={tabName}
                    width={cutout.width}
                    height={cutout.height}
                    priority={index === 0}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="h-full w-full object-contain object-bottom drop-shadow-[0_24px_32px_rgb(10_26_74/0.28)]"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ---- copy, then the quote strip ---- */}
        <div className="relative z-10 order-2 lg:order-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={slide.id} {...fade}>
              <p className="flex items-center gap-2.5 font-mono text-[11.5px] font-semibold tracking-[0.28em] text-ink-muted uppercase [&:lang(th)]:tracking-[0.06em]">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                {pick(slide.eyebrow, locale)}
              </p>
              {/* one slide shows at a time, so there is always exactly one
                  h1 — the server renders the first (the CMS headline) */}
              <h1 className="mt-4 font-display text-[36px] leading-[1.04] font-extrabold tracking-tight text-content sm:text-5xl lg:text-[3.1rem] xl:text-[3.5rem]">
                {headline}
                <span className="block text-accent-600 dark:text-accent-gradient">{accent}</span>
              </h1>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-muted sm:text-base lg:text-[17px]">
                {sub}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href={slide.href}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-accent-gradient px-7 text-[15px] font-bold"
                >
                  {t("learnMore")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                {slide.interest === "lawn-mowing" && (
                  <Link
                    href="/products/request-a-demo"
                    className="inline-flex min-h-12 items-center gap-2 rounded-full border border-content/20 bg-surface/60 px-6 text-[15px] font-semibold text-content transition-colors hover:border-content/50"
                  >
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    {t("bookDemo")}
                  </Link>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* data-hero-quote: while this is on screen the navbar hides its own
              Get a quote (one way in at a time); it comes back once the
              strip has scrolled away under the bar */}
          <div className="mt-7" data-hero-quote>
            <QuoteStrip interest={slide.interest} productId={slide.productId} />
          </div>

          <Link
            href="/recommend"
            className="mt-5 inline-flex items-center gap-1.5 text-[14px] text-ink-muted transition-colors hover:text-content"
          >
            {t("finderPrompt")}
            <span className="font-semibold text-accent-600 underline-offset-4 hover:underline">
              {t("finderLink")}
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-accent-600" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* ---- the families, and why buy here ---- */}
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-10 sm:px-6 lg:px-8 lg:pt-6 lg:pb-10">
        {/* The families as small robot cards: a thumbnail of the robot, its
            name and an arrow, raised off the canvas, lifting on hover — so
            they read as things to press, not labels. The one on show is
            filled in the accent with a ring. */}
        {slides.length > 1 && (
          <div
            role="tablist"
            aria-label={t("slidesLabel")}
            className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 py-1 sm:mx-0 sm:flex-wrap sm:px-0"
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
                  onClick={() => setIndex(i)}
                  className={`group flex h-14 shrink-0 cursor-pointer items-center gap-3 rounded-2xl border py-1.5 pr-4 pl-1.5 text-[14px] font-semibold whitespace-nowrap transition-[transform,box-shadow,border-color,background-color] duration-200 active:scale-[0.97] motion-reduce:transition-none ${
                    active
                      ? "border-accent bg-accent text-on-accent shadow-[0_10px_24px_-10px_rgb(var(--accent-rgb)/0.8)] ring-4 ring-accent/15"
                      : "border-forest-100 bg-white text-content shadow-[0_6px_16px_-10px_rgb(10_26_74/0.35)] hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_12px_24px_-12px_rgb(10_26_74/0.45)] motion-reduce:hover:translate-y-0 dark:bg-forest"
                  }`}
                >
                  <span
                    className={`flex h-11 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl ${
                      active ? "bg-white/20" : "bg-accent-50"
                    }`}
                  >
                    {s.cutout && (
                      <Image
                        src={s.cutout.src}
                        alt=""
                        width={s.cutout.width}
                        height={s.cutout.height}
                        sizes="56px"
                        className="h-9 w-12 object-contain transition-transform duration-300 group-hover:scale-110 motion-reduce:group-hover:scale-100"
                      />
                    )}
                  </span>
                  {pick(s.tab, locale)}
                  <ArrowRight
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                      active ? "opacity-90" : "text-accent-600 group-hover:translate-x-0.5"
                    }`}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-7 flex flex-col gap-5 border-t border-forest-100 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <ul aria-label={tq("promisesLabel")} className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-7">
            {PROMISES.map((key) => (
              <li key={key} className="flex items-center gap-2.5 text-[13.5px] font-semibold text-content">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent">
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                </span>
                {tq(`promises.${key}`)}
              </li>
            ))}
          </ul>
          <div className="w-full max-w-xs sm:w-64">
            <LineChatButton />
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Calendar, Pause, Play } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useSiteContent } from "@/components/SiteContentProvider";
import { useQuote } from "@/components/quote/QuoteProvider";
import { pick } from "@/data/siteContent";
import { heroSlides } from "@/data/homeShowcase";
import ShowcasePhoto from "@/components/ui/ShowcasePhoto";
import HeroQuote from "@/components/quote/HeroQuote";

/** How long each slide stays up before the next, while playing. */
const SLIDE_MS = 7000;

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
const subscribeReduce = (onChange: () => void) => {
  const mq = window.matchMedia(REDUCE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
const subscribeVisibility = (onChange: () => void) => {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
};

/**
 * Homepage hero: a photo per priority robot family (data/homeShowcase.ts),
 * one at a time, with the quote card docked on the right.
 *
 * From lg the copy sits over the photo's lower-left (a bottom scrim keeps it
 * readable on any photo) and the card floats on the right. Below lg the photo
 * stands alone and the copy, the tabs and then the card follow it on the page
 * surface — the photos are landscape, so overlaying copy on a phone would
 * cover the robot.
 *
 * The slides advance on their own. Each tab carries an accent bar that fills over
 * SLIDE_MS — the next slide comes when it's full. Hovering the copy or tabs
 * (not the photo: on desktop it fills the screen, so the pointer is nearly
 * always over it), focusing anything in the hero, filling in the quote card,
 * or the pause button all stop it;
 * with reduced motion it never starts. The first slide's copy is the CMS hero
 * headline, so Admin → Content → Homepage still sets the site's lead message.
 */
export default function HeroSection() {
  const t = useTranslations("showcase");
  const locale = useLocale();
  const { home } = useSiteContent();
  const { openQuote } = useQuote();
  // The server can't know either, so it renders the still, paused state and
  // the browser picks up from there once hydrated (no markup mismatch).
  const reduceMotion = useSyncExternalStore(
    subscribeReduce,
    () => window.matchMedia(REDUCE_QUERY).matches,
    () => true
  );
  // A backgrounded tab would otherwise flick through slides nobody sees.
  const visible = useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "visible",
    () => false
  );

  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const autoplay = !reduceMotion && !userPaused;
  const running = autoplay && !hovered && !focused && !formOpen;

  const next = useCallback(() => setIndex((i) => (i + 1) % heroSlides.length), []);

  const slide = heroSlides[index];
  const headline = slide.headline ? pick(slide.headline, locale) : pick(home.heroHeadline, locale);
  const accent = slide.accent ? pick(slide.accent, locale) : pick(home.heroAccent, locale);
  const sub = slide.sub ? pick(slide.sub, locale) : pick(home.heroSub, locale);

  return (
    // overflow clip, not hidden: a hidden box is still a scroll container, and
    // focusing the quote form once scrolled the hero's own content out of reach.
    <section
      aria-roledescription="carousel"
      aria-label={t("slidesLabel")}
      // -mt: the hero runs up under the navbar, which sits clear over it
      // until the page scrolls (Navbar, data-clear); 69px = bar + border
      className="relative -mt-[69px] overflow-hidden bg-surface supports-[overflow:clip]:overflow-clip lg:bg-forest-950"
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setFocused(false);
      }}
    >
      {/* ---- the photos, cross-fading ---- */}
      <div
        // photo area plus the 69px the navbar covers; from lg one full
        // screen (nothing sits above the navbar)
        className="relative h-[calc(75vw+69px)] sm:h-[calc(56.25vw+69px)] lg:h-svh lg:min-h-[42rem] lg:max-h-[66rem]"
      >
        {heroSlides.map((s, i) => (
          <div
            key={s.id}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <ShowcasePhoto
              photo={s}
              alt={pick(s.tab, locale)}
              sizes="100vw"
              priority={i === 0}
              captionAt="top"
            />
          </div>
        ))}
        {/* Bottom scrim, desktop only: the copy sits here from lg. Dark enough
            for white text on bright lawn, gone by mid-height so the robot
            itself stays untinted. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(to_top,rgba(10,10,11,0.85)_0%,rgba(10,10,11,0.55)_34%,rgba(10,10,11,0)_66%)] lg:block"
        />
      </div>

      {/* ---- copy + tabs: under the photo on phones, over it from lg ---- */}
      <div
        className="relative z-10 mx-auto max-w-7xl px-4 pt-7 sm:px-6 lg:absolute lg:inset-x-0 lg:bottom-0 lg:px-8 lg:pt-0 lg:pb-8 lg:[text-shadow:0_1px_14px_rgba(0,0,0,0.35)]"
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {/* leaves the quote card's column (26.5rem open + gap) free */}
        <div className="lg:max-w-[min(42rem,calc(100%-29rem))]">
          <div aria-live={running ? "off" : "polite"}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="flex items-center gap-2.5 font-mono text-[11.5px] font-semibold tracking-[0.28em] text-ink-muted uppercase lg:text-white/85 [&:lang(th)]:tracking-[0.06em]">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                  {pick(slide.eyebrow, locale)}
                </p>
                {/* one slide shows at a time, so there is always exactly one
                    h1 — the server renders the first (the CMS headline) */}
                <h1 className="mt-3 font-display text-[34px] leading-[1.04] font-extrabold tracking-tight text-content sm:text-5xl lg:text-5xl lg:text-white xl:text-[3.5rem]">
                  {headline}
                  <span className="block text-accent-600 lg:text-accent-gradient">{accent}</span>
                </h1>
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted sm:text-base lg:text-[17px] lg:text-white/85">
                  {sub}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href={slide.href}
                    className="inline-flex min-h-12 items-center gap-2 rounded-full bg-accent-gradient px-7 text-[15px] font-bold"
                  >
                    {t("learnMore")}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  {slide.interest === "lawn-mowing" ? (
                    <Link
                      href="/products/request-a-demo"
                      className="inline-flex min-h-12 items-center gap-2 rounded-full border border-content/20 px-6 text-[15px] font-semibold text-content transition-colors hover:border-content/50 lg:border-white/40 lg:text-white lg:hover:border-white"
                    >
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                      {t("bookDemo")}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openQuote({ interest: slide.interest })}
                      className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full border border-content/20 px-6 text-[15px] font-semibold text-content transition-colors hover:border-content/50 lg:border-white/40 lg:text-white lg:hover:border-white"
                    >
                      {t("getQuote")}
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ---- tabs: which family is on show, and how long until the next ---- */}
          <div className="mt-8 flex items-stretch gap-3 lg:mt-10">
            <div role="tablist" aria-label={t("slidesLabel")} className="grid flex-1 grid-cols-2 gap-3">
              {heroSlides.map((s, i) => {
                const active = i === index;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={t("showSlide", { name: pick(s.tab, locale) })}
                    onClick={() => setIndex(i)}
                    className="group cursor-pointer pt-3 text-left"
                  >
                    <span className="relative block h-[3px] overflow-hidden rounded-full bg-content/12 lg:bg-white/25">
                      {active && (
                        <span
                          key={`${s.id}-${index}`}
                          // with reduced motion globals.css drops the fill
                          // animation: the bar just marks the tab on show
                          className="hero-progress absolute inset-0 origin-left rounded-full bg-accent"
                          style={{
                            animationDuration: `${SLIDE_MS}ms`,
                            animationPlayState: running && visible ? "running" : "paused",
                          }}
                          onAnimationEnd={next}
                        />
                      )}
                    </span>
                    <span
                      className={`mt-2.5 block text-[13.5px] font-semibold transition-colors ${
                        active
                          ? "text-content lg:text-white"
                          : "text-ink-muted group-hover:text-content lg:text-white/60 lg:group-hover:text-white"
                      }`}
                    >
                      {pick(s.tab, locale)}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* nothing plays with reduced motion, so nothing to pause — hidden
                in CSS, not by the hook, so server and client markup match */}
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={userPaused ? t("play") : t("pause")}
              className="mt-1 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center self-center rounded-full border border-content/15 text-content transition-colors hover:border-content/40 motion-reduce:hidden lg:border-white/30 lg:text-white lg:hover:border-white"
            >
              {userPaused ? (
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Pause className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ---- quote card: after the copy on phones, docked right from lg ---- */}
      <div className="relative z-20 flex justify-center px-4 pt-8 pb-14 lg:absolute lg:inset-y-0 lg:right-[max(2rem,calc((100%-80rem)/2+2rem))] lg:items-center lg:p-0">
        <HeroQuote onOpenChange={setFormOpen} />
      </div>
    </section>
  );
}

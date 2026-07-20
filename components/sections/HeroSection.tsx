"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Sparkles, Waves } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { DeliveryRobotIcon, GrassIcon } from "@/components/ui/BrandIcons";
import { siteConfig } from "@/data/siteConfig";

/** Robot categories surfaced as hero chips (order = how they read left to right). */
const HERO_CATEGORIES = [
  { slug: "robot-mowers", Icon: GrassIcon },
  { slug: "pool-cleaners", Icon: Waves },
  { slug: "cleaning-robots", Icon: Sparkles },
  { slug: "delivery-robots", Icon: DeliveryRobotIcon },
] as const;

/** Spring pop-in for each chip, staggered by the parent. */
const chipVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 420, damping: 24 },
  },
};

/**
 * Full-bleed hero background that plays the configured videos in sequence,
 * looping back to the first when the last one ends. A single video simply
 * loops. `key={src}` remounts the element so the next clip autoplays.
 *
 * iOS Safari will only autoplay a video that is muted AND inline. React sets
 * `muted` as a DOM property but does not always emit the HTML attribute, and
 * Safari checks at load time — so the ref below asserts it directly, and the
 * play() promise is caught because iOS Low Power Mode refuses autoplay
 * outright (the poster then stays up, which is the intended fallback).
 */
function HeroVideoPlaylist({ urls, poster }: { urls: string[]; poster?: string }) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLVideoElement>(null);
  const src = urls[index % urls.length];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = true; // must be set before play() for iOS to allow it
    const attempt = el.play();
    if (attempt) attempt.catch(() => undefined); // blocked (e.g. Low Power Mode) — poster remains
  }, [src]);

  return (
    <video
      key={src}
      ref={ref}
      className="absolute inset-0 h-full w-full object-cover"
      src={src}
      poster={poster}
      autoPlay
      muted
      loop={urls.length === 1}
      playsInline
      preload="auto"
      onEnded={() => setIndex((i) => (i + 1) % urls.length)}
      aria-hidden="true"
    />
  );
}

/* Deterministic pollen positions — no Math.random, avoids hydration mismatch */
const POLLEN = [
  { left: "6%", size: 5, delay: 0, duration: 13, opacity: 0.7 },
  { left: "14%", size: 4, delay: 4.2, duration: 16, opacity: 0.5 },
  { left: "22%", size: 6, delay: 1.6, duration: 12, opacity: 0.8 },
  { left: "31%", size: 4, delay: 6.8, duration: 15, opacity: 0.55 },
  { left: "39%", size: 5, delay: 2.4, duration: 14, opacity: 0.75 },
  { left: "48%", size: 4, delay: 8.4, duration: 17, opacity: 0.45 },
  { left: "56%", size: 6, delay: 0.9, duration: 12.5, opacity: 0.85 },
  { left: "63%", size: 4, delay: 5.3, duration: 15.5, opacity: 0.5 },
  { left: "71%", size: 5, delay: 3.1, duration: 13.5, opacity: 0.7 },
  { left: "79%", size: 4, delay: 7.6, duration: 16.5, opacity: 0.55 },
  { left: "87%", size: 6, delay: 1.2, duration: 12, opacity: 0.75 },
  { left: "94%", size: 4, delay: 9.1, duration: 14.5, opacity: 0.5 },
];

/** Daylight robot mower — cream shell, forest chassis, gold accents */
function MowerSvg() {
  return (
    <svg
      viewBox="0 0 220 130"
      className="h-24 w-auto drop-shadow-[0_12px_18px_rgba(11,46,31,0.3)] sm:h-28"
      role="img"
      aria-label="Robot mower cutting the lawn"
    >
      {/* soft ground shadow */}
      <ellipse cx="110" cy="119" rx="82" ry="9" fill="#0b2e1f" opacity="0.22" />
      {/* gold underglow — the robot's "tech" signature */}
      <ellipse cx="110" cy="114" rx="64" ry="7" fill="#f5c842" opacity="0.35" className="animate-glow" />
      {/* chassis */}
      <path d="M28 92 L40 56 Q44 44 58 42 L156 42 Q170 44 174 56 L192 92 Q193 100 183 100 L37 100 Q27 100 28 92Z" fill="#123b28" stroke="#1a5c3e" strokeWidth="2" />
      {/* cream shell */}
      <path d="M42 84 L52 58 Q55 51 64 50 L150 50 Q159 51 162 58 L176 84 Q177 90 169 90 L49 90 Q41 90 42 84Z" fill="#fdfdf8" />
      {/* shell shading */}
      <path d="M42 84 L52 58 Q55 51 64 50 L86 50 L70 90 L49 90 Q41 90 42 84Z" fill="#eef4ea" />
      {/* gold bumper */}
      <rect x="44" y="78" width="132" height="6" rx="3" fill="#f5c842" />
      {/* green accent stripe on shell */}
      <rect x="58" y="56" width="104" height="4" rx="2" fill="#237a52" opacity="0.85" />
      {/* lidar dome */}
      <rect x="92" y="24" width="36" height="20" rx="9" fill="#123b28" stroke="#1a5c3e" strokeWidth="1.5" />
      <circle cx="110" cy="24" r="5" fill="#f5c842" className="animate-blink" />
      {/* headlight */}
      <path d="M182 66 L212 58 L212 78 L184 74Z" fill="#ffe08a" opacity="0.35" />
      <circle cx="181" cy="68" r="4" fill="#f5c842" />
      {/* wheels */}
      <g className="animate-wheel">
        <circle cx="64" cy="100" r="22" fill="#0b2e1f" stroke="#1a5c3e" strokeWidth="2" />
        <circle cx="64" cy="100" r="11" fill="#123b28" />
        <circle cx="64" cy="100" r="3.5" fill="#f5c842" />
        <line x1="64" y1="82" x2="64" y2="90" stroke="#2e7d4f" strokeWidth="2.5" />
        <line x1="64" y1="110" x2="64" y2="118" stroke="#2e7d4f" strokeWidth="2.5" />
        <line x1="46" y1="100" x2="54" y2="100" stroke="#2e7d4f" strokeWidth="2.5" />
        <line x1="74" y1="100" x2="82" y2="100" stroke="#2e7d4f" strokeWidth="2.5" />
      </g>
      <g className="animate-wheel">
        <circle cx="152" cy="100" r="22" fill="#0b2e1f" stroke="#1a5c3e" strokeWidth="2" />
        <circle cx="152" cy="100" r="11" fill="#123b28" />
        <circle cx="152" cy="100" r="3.5" fill="#f5c842" />
        <line x1="152" y1="82" x2="152" y2="90" stroke="#2e7d4f" strokeWidth="2.5" />
        <line x1="152" y1="110" x2="152" y2="118" stroke="#2e7d4f" strokeWidth="2.5" />
        <line x1="134" y1="100" x2="142" y2="100" stroke="#2e7d4f" strokeWidth="2.5" />
        <line x1="162" y1="100" x2="170" y2="100" stroke="#2e7d4f" strokeWidth="2.5" />
      </g>
    </svg>
  );
}

const wordVariants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function HeroSection() {
  const t = useTranslations("hero");
  const tCat = useTranslations("hero.cat");
  // Thai separates phrases (not words) with spaces, so splitting on
  // spaces gives natural stagger chunks in both languages
  const mainWords = t("headlineMain").split(" ");
  const accentWords = t("headlineAccent").split(" ");

  const videos = siteConfig.heroVideoUrls;
  const video = videos.length > 0;

  return (
    <section
      className={`relative overflow-hidden ${
        video
          ? "bg-forest-950 text-white"
          : "bg-gradient-to-b from-surface via-[#f1f8ee] to-[#e4f1e0] text-content dark:via-forest-900 dark:to-forest-800"
      }`}
    >
      {video ? (
        /* ---- video hero: cycles the playlist set in data/siteConfig.ts ---- */
        <>
          <HeroVideoPlaylist
            urls={videos}
            poster={siteConfig.heroVideoPoster ?? undefined}
          />
          {/* Legibility scrim. Deliberately strong: the clips are dark, and in
              dark mode this tint is navy over them, so contrast can't come from
              the overlay colour alone. Linear band + a radial pool behind the
              copy; .hero-legible on the text is the third layer. */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-forest-950/85 via-forest-950/55 to-forest-950/85"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_45%,rgba(3,8,24,0.55),transparent_75%)]"
            aria-hidden="true"
          />
        </>
      ) : (
        /* ---- animated fallback: morning sun + drifting pollen ---- */
        <>
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gradient-to-br from-gold-300 to-gold opacity-35 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute right-16 top-14 hidden h-24 w-24 rounded-full bg-gradient-to-br from-gold-300 to-gold opacity-80 shadow-[0_0_60px_12px_rgba(245,200,66,0.45)] sm:block"
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            {POLLEN.map((p, i) => (
              <span
                key={i}
                className="animate-firefly absolute bottom-40 rounded-full bg-gold"
                style={
                  {
                    left: p.left,
                    width: p.size,
                    height: p.size,
                    "--fly-delay": `${p.delay}s`,
                    "--fly-duration": `${p.duration}s`,
                    "--fly-opacity": p.opacity,
                    boxShadow: "0 0 10px 2px rgba(217,169,22,0.4)",
                  } as React.CSSProperties
                }
              />
            ))}
          </div>
        </>
      )}

      {/* copy */}
      <div
        className={`relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 text-center sm:px-6 ${
          video ? "pb-32 pt-24 sm:pb-40 sm:pt-36" : "pb-56 pt-20 sm:pb-64 sm:pt-28"
        }`}
      >
        {/* Category chips: at a glance, what the store sells — and each one is a
            direct link into that category's products. */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col items-center gap-3"
        >
          <span
            className={`font-mono text-[12.5px] font-semibold uppercase tracking-[0.35em] ${
              video ? "hero-legible text-gold" : "text-gold-600"
            }`}
          >
            {t("categoriesLabel")}
          </span>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }}
            className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3"
          >
            {HERO_CATEGORIES.map(({ slug, Icon }) => (
              <motion.div
                key={slug}
                variants={chipVariants}
                whileHover={{ y: -3, scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={`/shop/${slug}`}
                  className={`group flex items-center gap-2.5 rounded-full border px-5 py-2.5 font-mono text-[14px] font-bold uppercase tracking-[0.15em] transition-colors duration-300 sm:px-6 sm:text-[15px] ${
                    video
                      ? "hero-legible border-white/30 bg-white/10 text-white hover:border-gold hover:bg-gold hover:text-forest-950 hover:shadow-[0_10px_30px_-6px_rgba(245,200,66,0.55)]"
                      : "border-forest-950/15 bg-forest-950/[0.03] text-forest-800 hover:border-gold hover:bg-gold hover:text-forest-950 hover:shadow-[0_10px_30px_-8px_rgba(245,200,66,0.5)] dark:border-white/20 dark:bg-white/5 dark:text-white/90 dark:hover:text-forest-950"
                  }`}
                >
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 transition-colors duration-300 group-hover:text-forest-950 ${
                      video ? "text-gold" : "text-gold-600 dark:text-gold"
                    }`}
                    aria-hidden="true"
                  />
                  {tCat(slug)}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.09, delayChildren: 0.2 } } }}
          className={`font-display text-[42px] font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl ${
            video ? "hero-legible" : ""
          }`}
        >
          {[...mainWords, ...accentWords].map((word, i) => (
            <Fragment key={i}>
              {/* The gold accent phrase always starts its own line, so the
                  headline lands as the two lines the copy was written as
                  rather than wherever the container happens to wrap. */}
              {i === mainWords.length && <br />}
              <motion.span
                variants={wordVariants}
                className={`inline-block ${
                  i >= mainWords.length
                    ? video
                      ? "text-gold"
                      : "text-forest-700 dark:text-gold"
                    : ""
                }`}
              >
              {word}
              {/*  : plain spaces collapse at the end of inline-blocks */}
              {i < mainWords.length + accentWords.length - 1 && " "}
              </motion.span>
            </Fragment>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className={`mt-7 max-w-2xl text-base leading-relaxed sm:text-lg ${
            video ? "hero-legible text-white/90" : "text-ink-muted"
          }`}
        >
          {t("sub")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link
            href="/shop"
            className="flex min-h-[52px] items-center gap-2 rounded-full bg-gold px-8 text-[15px] font-bold text-forest-950 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_36px_-6px_rgba(245,200,66,0.8)] active:scale-[0.97]"
          >
            {t("ctaPrimary")}
            <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
          </Link>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className={`flex min-h-[52px] items-center gap-2 rounded-full border-2 px-8 text-[15px] font-semibold transition-colors duration-300 ${
              video
                ? "border-white/40 text-white hover:border-gold hover:text-gold"
                : "border-content/25 text-content hover:border-gold-600 hover:text-gold-600"
            }`}
          >
            <Calendar className="h-4.5 w-4.5" aria-hidden="true" />
            {t("ctaSecondary")}
          </motion.a>
        </motion.div>
      </div>

      {/* ---- animated lawn scene (hidden when a video is configured) ---- */}
      {!video && (
        <div className="absolute inset-x-0 bottom-0 h-48 sm:h-56" aria-hidden="true">
          {/* uncut lawn — daylight greens */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#4caf72] to-[#2e7d4f]" />
          {/* blend lawn horizon into the sky (navy sky in dark mode) */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#e4f1e0] to-transparent dark:from-forest-800" />

          {/* grass blade silhouettes along the horizon */}
          <svg className="absolute inset-x-0 -top-3 h-4 w-full" preserveAspectRatio="none">
            <defs>
              <pattern id="grass-tufts" width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M0 16 L4 3 L6 16 L10 0 L12 16 L15 6 L16 16Z" fill="#3f9c63" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grass-tufts)" />
          </svg>

          {/* cut-lawn trail — grows behind the mower, striped like a fresh mow */}
          <div
            className="animate-trail absolute bottom-6 left-0 h-24 sm:h-28"
            style={{
              background:
                "repeating-linear-gradient(90deg, #8fd3a4 0px, #8fd3a4 46px, #6fc28b 46px, #6fc28b 92px)",
              boxShadow: "0 0 24px rgba(255,255,255,0.3)",
              maskImage: "linear-gradient(to right, black 96%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, black 96%, transparent)",
            }}
          />

          {/* the mower */}
          <div className="animate-mow absolute bottom-9 left-0 sm:bottom-10">
            <MowerSvg />
          </div>

          {/* foreground grass strip */}
          <div className="absolute inset-x-0 bottom-0 h-6 bg-[#27714a]" />
        </div>
      )}
    </section>
  );
}

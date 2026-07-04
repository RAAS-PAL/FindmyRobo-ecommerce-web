"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import { Link } from "@/i18n/navigation";

/* Deterministic firefly positions — no Math.random, avoids hydration mismatch */
const FIREFLIES = [
  { left: "6%", size: 4, delay: 0, duration: 13, opacity: 0.55 },
  { left: "14%", size: 3, delay: 4.2, duration: 16, opacity: 0.4 },
  { left: "22%", size: 5, delay: 1.6, duration: 12, opacity: 0.65 },
  { left: "31%", size: 3, delay: 6.8, duration: 15, opacity: 0.45 },
  { left: "39%", size: 4, delay: 2.4, duration: 14, opacity: 0.6 },
  { left: "48%", size: 3, delay: 8.4, duration: 17, opacity: 0.35 },
  { left: "56%", size: 5, delay: 0.9, duration: 12.5, opacity: 0.7 },
  { left: "63%", size: 3, delay: 5.3, duration: 15.5, opacity: 0.4 },
  { left: "71%", size: 4, delay: 3.1, duration: 13.5, opacity: 0.55 },
  { left: "79%", size: 3, delay: 7.6, duration: 16.5, opacity: 0.45 },
  { left: "87%", size: 5, delay: 1.2, duration: 12, opacity: 0.6 },
  { left: "94%", size: 3, delay: 9.1, duration: 14.5, opacity: 0.4 },
];

function MowerSvg() {
  return (
    <svg
      viewBox="0 0 220 130"
      className="h-24 w-auto drop-shadow-[0_0_18px_rgba(245,200,66,0.35)] sm:h-28"
      role="img"
      aria-label="Robot mower cutting the lawn"
    >
      {/* gold underglow */}
      <ellipse cx="110" cy="118" rx="80" ry="10" fill="#f5c842" opacity="0.4" className="animate-glow" />
      {/* chassis */}
      <path d="M28 92 L40 56 Q44 44 58 42 L156 42 Q170 44 174 56 L192 92 Q193 100 183 100 L37 100 Q27 100 28 92Z" fill="#0d1b4b" stroke="#21358a" strokeWidth="2" />
      {/* shell */}
      <path d="M42 84 L52 58 Q55 51 64 50 L150 50 Q159 51 162 58 L176 84 Q177 90 169 90 L49 90 Q41 90 42 84Z" fill="#16276b" />
      {/* gold bumper */}
      <rect x="44" y="78" width="132" height="6" rx="3" fill="#f5c842" />
      {/* lidar dome */}
      <rect x="92" y="24" width="36" height="20" rx="9" fill="#070f2e" stroke="#21358a" strokeWidth="1.5" />
      <circle cx="110" cy="24" r="5" fill="#f5c842" className="animate-blink" />
      {/* headlight beam */}
      <path d="M182 66 L212 58 L212 78 L184 74Z" fill="#ffe08a" opacity="0.25" />
      <circle cx="181" cy="68" r="4" fill="#ffe08a" />
      {/* wheels */}
      <g className="animate-wheel">
        <circle cx="64" cy="100" r="22" fill="#070f2e" stroke="#21358a" strokeWidth="2" />
        <circle cx="64" cy="100" r="11" fill="#16276b" />
        <circle cx="64" cy="100" r="3.5" fill="#f5c842" />
        <line x1="64" y1="82" x2="64" y2="90" stroke="#21358a" strokeWidth="2.5" />
        <line x1="64" y1="110" x2="64" y2="118" stroke="#21358a" strokeWidth="2.5" />
        <line x1="46" y1="100" x2="54" y2="100" stroke="#21358a" strokeWidth="2.5" />
        <line x1="74" y1="100" x2="82" y2="100" stroke="#21358a" strokeWidth="2.5" />
      </g>
      <g className="animate-wheel">
        <circle cx="152" cy="100" r="22" fill="#070f2e" stroke="#21358a" strokeWidth="2" />
        <circle cx="152" cy="100" r="11" fill="#16276b" />
        <circle cx="152" cy="100" r="3.5" fill="#f5c842" />
        <line x1="152" y1="82" x2="152" y2="90" stroke="#21358a" strokeWidth="2.5" />
        <line x1="152" y1="110" x2="152" y2="118" stroke="#21358a" strokeWidth="2.5" />
        <line x1="134" y1="100" x2="142" y2="100" stroke="#21358a" strokeWidth="2.5" />
        <line x1="162" y1="100" x2="170" y2="100" stroke="#21358a" strokeWidth="2.5" />
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
  // Thai separates phrases (not words) with spaces, so splitting on
  // spaces gives natural stagger chunks in both languages
  const mainWords = t("headlineMain").split(" ");
  const accentWords = t("headlineAccent").split(" ");

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy to-navy-950 text-white">
      {/* ambient gold radial glow behind headline */}
      <div
        className="pointer-events-none absolute left-1/2 top-24 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gold/[0.07] blur-[120px]"
        aria-hidden="true"
      />

      {/* fireflies */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {FIREFLIES.map((f, i) => (
          <span
            key={i}
            className="animate-firefly absolute bottom-40 rounded-full bg-gold"
            style={
              {
                left: f.left,
                width: f.size,
                height: f.size,
                "--fly-delay": `${f.delay}s`,
                "--fly-duration": `${f.duration}s`,
                "--fly-opacity": f.opacity,
                boxShadow: "0 0 8px 2px rgba(245,200,66,0.35)",
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* copy */}
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 pb-56 pt-20 text-center sm:px-6 sm:pb-64 sm:pt-28">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-gold sm:text-xs"
        >
          {t("eyebrow")}
        </motion.p>

        <motion.h1
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.09, delayChildren: 0.2 } } }}
          className="font-display text-[42px] font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
        >
          {[...mainWords, ...accentWords].map((word, i) => (
            <motion.span
              key={i}
              variants={wordVariants}
              className={`inline-block ${i >= mainWords.length ? "text-gold" : ""}`}
            >
              {word}
              {i < mainWords.length + accentWords.length - 1 && " "}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg"
        >
          {t("subBefore")}{" "}
          <span className="font-semibold text-white">{t("subBrand")}</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link
            href="/shop"
            className="flex min-h-[52px] items-center gap-2 rounded-full bg-gold px-8 text-[15px] font-bold text-navy-950 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_36px_-6px_rgba(245,200,66,0.8)] active:scale-[0.97]"
          >
            {t("ctaPrimary")}
            <ArrowRight className="h-4.5 w-4.5" aria-hidden="true" />
          </Link>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex min-h-[52px] items-center gap-2 rounded-full border-2 border-white/30 px-8 text-[15px] font-semibold text-white transition-colors duration-300 hover:border-gold hover:text-gold"
          >
            <Calendar className="h-4.5 w-4.5" aria-hidden="true" />
            {t("ctaSecondary")}
          </motion.a>
        </motion.div>
      </div>

      {/* ---- animated lawn scene ---- */}
      <div className="absolute inset-x-0 bottom-0 h-48 sm:h-56" aria-hidden="true">
        {/* uncut lawn */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f3d2e] to-[#081f18]" />
        {/* blend lawn horizon into the navy sky */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-navy-950 to-transparent" />

        {/* grass blade silhouettes along the horizon */}
        <svg className="absolute inset-x-0 -top-3 h-4 w-full" preserveAspectRatio="none">
          <defs>
            <pattern id="grass-tufts" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M0 16 L4 3 L6 16 L10 0 L12 16 L15 6 L16 16Z" fill="#0f3d2e" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grass-tufts)" />
        </svg>

        {/* cut-lawn trail — grows behind the mower, striped like a fresh mow */}
        <div
          className="animate-trail absolute bottom-6 left-0 h-24 sm:h-28"
          style={{
            background:
              "repeating-linear-gradient(90deg, #1c5a43 0px, #1c5a43 46px, #237053 46px, #237053 92px)",
            boxShadow: "0 0 24px rgba(245,200,66,0.12)",
            maskImage: "linear-gradient(to right, black 96%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, black 96%, transparent)",
          }}
        />

        {/* the mower */}
        <div className="animate-mow absolute bottom-9 left-0 sm:bottom-10">
          <MowerSvg />
        </div>

        {/* foreground grass strip */}
        <div className="absolute inset-x-0 bottom-0 h-6 bg-[#081f18]" />
      </div>
    </section>
  );
}

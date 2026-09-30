"use client";

import { useTranslations } from "next-intl";
import FadeIn from "@/components/ui/FadeIn";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

/**
 * Bold stats band right after the product cards: big count-up numbers on a
 * dark panel to make the robots' capabilities pop (Mammotion-style callout).
 * The figures below are product-capability numbers — edit the `to`/`suffix`
 * values here to change them.
 */
export default function StatsBand() {
  const t = useTranslations("stats");
  const stats = [
    { to: 5000, suffix: " m²", label: t("coverage") },
    { to: 45, suffix: "%", label: t("slope") },
    { to: 500, suffix: " m²/h", label: t("speed") },
    { to: 360, suffix: "°", label: t("vision") },
  ];

  return (
    <section className="bg-forest-950 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-300">
            {t("eyebrow")}
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            {t("heading")}
          </h2>
        </FadeIn>

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:mt-14 lg:grid-cols-4 lg:gap-10">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.08} className="text-center">
              <AnimatedCounter
                to={stat.to}
                suffix={stat.suffix}
                className="block font-mono text-[44px] font-bold leading-none tabular-nums text-accent-300 sm:text-6xl"
              />
              <p className="mt-3 text-[13px] font-semibold uppercase tracking-wide text-white/70 sm:text-sm">
                {stat.label}
              </p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

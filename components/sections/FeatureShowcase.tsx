"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { siteConfig, type ShowcaseFeature } from "@/data/siteConfig";
import type { Locale } from "@/data/products";

/**
 * Scroll-storytelling feature showcase: one large centred product image (~80%
 * of the screen) stays pinned while you scroll through the section; scroll
 * progress swaps the image (cross-fade) and the caption box stacked over it.
 * The section is N×100vh tall so each feature gets a screen of scroll.
 * Content lives in siteConfig.featureShowcase.
 */
export default function FeatureShowcase() {
  const t = useTranslations("featureShowcase");
  const locale = useLocale() as Locale;
  const features = siteConfig.featureShowcase;
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const i = Math.floor(p * features.length);
    setActive(Math.min(features.length - 1, Math.max(0, i)));
  });

  if (features.length === 0) return null;
  const text = (v: ShowcaseFeature["heading"]) => v[locale] || v.en;

  return (
    <section
      ref={sectionRef}
      className="relative bg-forest-950"
      style={{ height: `${features.length * 100}vh` }}
    >
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center px-4 py-14 sm:px-6">
        {/* section heading */}
        <div className="text-center">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">
            {t("eyebrow")}
          </p>
          <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
            {t("heading")}
          </h2>
        </div>

        {/* centred image (~80% of the screen) with the caption stacked on it */}
        <div className="mt-8 flex w-full justify-center">
          <div className="relative">
            {features.map((f, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={f.image}
                alt=""
                className={`block max-h-[58vh] w-auto max-w-[88vw] rounded-3xl object-contain transition-opacity duration-500 lg:max-w-[80vw] ${
                  i === active
                    ? "opacity-100"
                    : "absolute inset-0 h-full w-full opacity-0"
                }`}
              />
            ))}

            {/* caption box — a bottom bar on phones (so it doesn't cover the
                product), an overlay on the right on larger screens */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-auto sm:left-auto sm:right-8 sm:top-1/2 sm:max-w-md sm:-translate-y-1/2">
              <div className="rounded-2xl border border-white/10 bg-black/55 p-5 backdrop-blur-md sm:p-7">
                <h3 className="font-display text-lg font-bold text-white sm:text-2xl">
                  {text(features[active].heading)}
                </h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-white/80 sm:text-[15px]">
                  {text(features[active].body)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* progress dots */}
        <div className="mt-7 flex gap-2">
          {features.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? "w-6 bg-gold" : "w-1.5 bg-white/30"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

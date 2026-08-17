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
      // svh, not vh: on mobile `vh` resolves to the viewport with the browser
      // bars *hidden*, so a 100vh panel is taller than what you can actually
      // see whenever the address bar and toolbar are showing, and the bottom of
      // the section gets cut off. `svh` is the smallest (bars visible) case, so
      // the panel fits either way. Deliberately not `dvh` — that one changes as
      // the bars collapse during scroll, which would resize this panel
      // mid-animation.
      style={{ height: `${features.length * 100}svh` }}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center px-4 py-14 sm:px-6">
        {/* section heading */}
        <div className="text-center">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">
            {t("eyebrow")}
          </p>
          <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
            {t("heading")}
          </h2>
        </div>

        {/* The wrapper shrinks to the image on desktop (lg:block makes the
            active <img> set its width), which is what lets the caption be
            positioned against the *photo's* edge rather than the section's.
            On phones it stays a flex column and the caption stacks underneath,
            where a 340px overlay would blanket the whole frame. */}
        <div className="mt-8 flex w-full justify-center">
          <div className="relative flex w-full max-w-[1600px] flex-col items-center gap-6 lg:block lg:w-auto lg:gap-0">
            {features.map((f, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={f.image}
                alt=""
                // Capped in svh (see the section element) because the whole
                // thing is one screen-height sticky panel: heading, image,
                // caption and dots all have to fit together, with the browser
                // bars showing. The phone value is the tightest — there the
                // caption stacks *below* the image rather than sitting inside
                // it, so it needs its own share of the height.
                className={`block max-h-[30svh] w-auto max-w-full rounded-3xl object-contain transition-opacity duration-500 sm:max-h-[35svh] lg:max-h-[49svh] ${
                  i === active
                    ? "opacity-100"
                    : "absolute inset-0 h-full w-full opacity-0"
                }`}
              />
            ))}

            {/* Caption, inset into the photo's right edge on desktop. It sits
                hard right with a small margin so it stays clear of the subject,
                which is centre-left in every showcase image — an earlier version
                centred this box over the frame and covered the product. */}
            <div className="w-full rounded-2xl border border-white/10 bg-black/55 p-5 backdrop-blur-md sm:p-7 lg:absolute lg:right-6 lg:top-1/2 lg:z-10 lg:w-[340px] lg:-translate-y-1/2">
              <h3 className="font-display text-lg font-bold text-white sm:text-2xl">
                {text(features[active].heading)}
              </h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-white/80 sm:text-[15px]">
                {text(features[active].body)}
              </p>
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

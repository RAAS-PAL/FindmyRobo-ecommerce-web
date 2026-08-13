"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";
import { techAnatomy, views } from "@/data/techAnatomy";
import type { Locale } from "@/data/products";

/**
 * "Under the hood" — the product renders with numbered hotspots. Selecting a
 * component switches to the view that actually shows it, then zooms in on it.
 *
 * Because the photo changes as you explore, it reads like an object being
 * turned — without a 3D model, a turntable sequence, or a WebGL dependency.
 *
 * The zoom is a CSS transform on the image layer:
 *   translate moves the focus point to the centre, then scale magnifies about
 *   that centre. Markers live inside the same layer so they travel with the
 *   image, and carry an inverse scale so they stay a constant size on screen.
 */
export default function TechAnatomy() {
  const t = useTranslations("techAnatomy");
  const locale = useLocale() as Locale;
  const [activeId, setActiveId] = useState(techAnatomy[0].id);

  const active = techAnatomy.find((h) => h.id === activeId) ?? techAnatomy[0];
  const view = views[active.view];
  // Only the markers belonging to the visible view are drawn.
  const markers = techAnatomy.filter((h) => h.view === active.view);

  return (
    <section id="technology" className="bg-forest-950 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {t("heading")}
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/60">
            {t("sub")}
          </p>
        </FadeIn>

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
          {/* viewer */}
          <FadeIn>
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-forest-900 to-forest-950">
              <div
                className="absolute inset-0 transition-transform duration-700 ease-out"
                style={{
                  transform: `scale(${active.zoom}) translate(${50 - active.x}%, ${50 - active.y}%)`,
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.view}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={view.src}
                      alt={view.label[locale]}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-contain"
                      priority={false}
                    />
                  </motion.div>
                </AnimatePresence>

                {markers.map((spot) => {
                  const isActive = spot.id === activeId;
                  const index = techAnatomy.findIndex((h) => h.id === spot.id);
                  return (
                    <button
                      key={spot.id}
                      type="button"
                      onClick={() => setActiveId(spot.id)}
                      aria-label={spot.title[locale]}
                      aria-pressed={isActive}
                      className="absolute z-10 flex items-center justify-center rounded-full font-mono text-[11px] font-bold transition-colors"
                      style={{
                        left: `${spot.x}%`,
                        top: `${spot.y}%`,
                        // Counter-scale so the marker stays the same size on
                        // screen no matter how far the image is zoomed.
                        transform: `translate(-50%, -50%) scale(${1 / active.zoom})`,
                        width: 34,
                        height: 34,
                      }}
                    >
                      <span
                        className={`flex h-full w-full items-center justify-center rounded-full border-2 ${
                          isActive
                            ? "border-gold bg-gold text-forest-950"
                            : "border-gold/70 bg-forest-950/80 text-gold backdrop-blur-sm hover:bg-gold/30"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* which angle we are looking at */}
              <span className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-forest-950/70 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70 backdrop-blur-sm">
                {view.label[locale]}
              </span>
            </div>
          </FadeIn>

          {/* controls + detail */}
          <div className="flex flex-col gap-5">
            <FadeIn>
              <ul className="flex flex-wrap gap-2">
                {techAnatomy.map((spot, index) => {
                  const isActive = spot.id === activeId;
                  return (
                    <li key={spot.id}>
                      <button
                        type="button"
                        onClick={() => setActiveId(spot.id)}
                        aria-pressed={isActive}
                        className={`flex min-h-[40px] cursor-pointer items-center gap-2 rounded-full border px-4 text-[12.5px] font-semibold transition-colors ${
                          isActive
                            ? "border-gold bg-gold text-forest-950"
                            : "border-white/20 text-white/70 hover:border-gold hover:text-gold"
                        }`}
                      >
                        <span className="font-mono text-[11px]">{index + 1}</span>
                        {spot.title[locale]}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </FadeIn>

            <FadeIn>
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                  >
                    <h3 className="font-display text-xl font-extrabold text-white sm:text-2xl">
                      {active.title[locale]}
                    </h3>
                    <p className="mt-3 text-[14.5px] leading-relaxed text-white/70">
                      {active.body[locale]}
                    </p>
                    <div className="mt-6 border-t border-white/10 pt-5">
                      <p className="font-mono text-3xl font-extrabold text-gold sm:text-4xl">
                        {active.stat}
                      </p>
                      <p className="mt-1 text-[12.5px] text-white/50">
                        {active.statLabel[locale]}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </FadeIn>

            <FadeIn>
              <p className="text-[11.5px] leading-relaxed text-white/40">
                {t("footnote")}
              </p>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}

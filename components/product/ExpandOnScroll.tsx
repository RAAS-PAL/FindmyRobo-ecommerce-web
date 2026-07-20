"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Scroll-driven full-bleed reveal: the panel starts as an inset, rounded card
 * and grows to fill the window as it scrolls up, then stays pinned there for
 * the rest of the runway before scrolling on — the effect the Mammotion
 * product pages use for their full-width scenes.
 *
 * Breaks out of the page's centered container on its own (left-1/2 + w-screen),
 * so it can be dropped inside the normal max-width column. The ancestor needs
 * `overflow-x-clip` to swallow the scrollbar-width overhang of `w-screen`.
 *
 * Honors prefers-reduced-motion by rendering the panel plainly, no pin, no
 * runway — a scroll-linked size change is exactly what that setting is for.
 */
export default function ExpandOnScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  // 0 while the section's top sits at the bottom of the viewport, 1 once it
  // reaches the top — so the growth finishes exactly as the panel pins.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"],
  });

  const width = useTransform(
    scrollYProgress,
    (p) => `calc(min(72rem, 92vw) + (100vw - min(72rem, 92vw)) * ${p})`
  );
  const height = useTransform(scrollYProgress, (p) => `${72 + 28 * p}vh`);
  const borderRadius = useTransform(scrollYProgress, (p) => `${24 - 24 * p}px`);

  if (reduced) {
    return (
      <div className="mx-auto max-w-6xl rounded-3xl bg-cloud px-4 py-10">
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative h-[180vh]">
      {/* Breaks out of the page's centered column to full viewport width.
          Negative margins, not left/translate: `left` on a sticky element is a
          sticky constraint rather than an offset, so it would not move this at
          all. 50% resolves against the column, 50vw against the window. */}
      <div className="sticky top-0 mx-[calc(50%-50vw)] flex h-screen w-screen items-center justify-center">
        <motion.div
          style={{ width, height, borderRadius }}
          // shrink-0: as a flex item it would otherwise be squeezed back to the
          // parent column's width and never reach full bleed
          className="flex shrink-0 items-center justify-center overflow-hidden bg-cloud"
        >
          {/* content scrolls inside if a long table outgrows the window */}
          <div className="max-h-full w-full overflow-y-auto px-4 py-10">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

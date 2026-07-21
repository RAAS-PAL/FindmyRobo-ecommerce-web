"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Scroll-driven full-bleed reveal: the panel starts as an inset, rounded card
 * and grows to fill the window's width as it scrolls into view, straightening
 * its corners — the full-width look the Mammotion product pages use.
 *
 * Deliberately does NOT pin or cap its height: the card sits in normal flow at
 * its natural (content) height, so the whole page scrolls through the specs as
 * one piece. No inner overflow box, so no nested scrollbar and no scroll-
 * hijacking — the expand is the only motion, driven by a MotionValue.
 *
 * Breaks out of the page's centered column on its own (w-screen + negative
 * margin), so it can be dropped inside the normal max-width column. The ancestor
 * needs `overflow-x-clip` to swallow the scrollbar-width overhang of `w-screen`.
 *
 * Honors prefers-reduced-motion by rendering the panel plainly — a scroll-linked
 * size change is exactly what that setting is for.
 */
export default function ExpandOnScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  // 0 while the section's top sits at the bottom of the viewport, 1 once it
  // reaches the middle — so the panel is fully open well before you read the
  // rows, then simply scrolls with the page from there.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start center"],
  });

  // Inset card (min(72rem, 92vw)) → full viewport width. Continuous calc so the
  // complex min() expression interpolates smoothly rather than snapping.
  const width = useTransform(
    scrollYProgress,
    (p) => `calc(min(72rem, 92vw) + (100vw - min(72rem, 92vw)) * ${p})`
  );
  const borderRadius = useTransform(scrollYProgress, (p) => `${24 - 24 * p}px`);

  if (reduced) {
    return (
      <div className="mx-auto max-w-6xl rounded-3xl bg-cloud px-4 py-10">
        {children}
      </div>
    );
  }

  return (
    // Full-bleed track in normal flow; the inner card grows to fill it.
    <div ref={ref} className="mx-[calc(50%-50vw)] w-screen">
      <motion.div
        style={{ width, borderRadius }}
        className="mx-auto overflow-hidden bg-cloud"
      >
        <div className="px-4 py-10 sm:py-14">{children}</div>
      </motion.div>
    </div>
  );
}

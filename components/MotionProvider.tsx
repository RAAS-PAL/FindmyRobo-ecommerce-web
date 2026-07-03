"use client";

import { MotionConfig } from "framer-motion";

/** Honors the user's prefers-reduced-motion setting for all Framer Motion animations. */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

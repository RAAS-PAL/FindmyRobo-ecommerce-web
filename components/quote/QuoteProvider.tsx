"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { QuoteInterest } from "@/lib/quoteRequest";

/**
 * What the quote panel was opened for — nothing, a product, a service for a
 * robot, or a robot family that has no catalogue product yet (a homepage banner).
 */
export interface QuoteTarget {
  productId?: string;
  /** For a service (demo, installation): the robot it is for. */
  forId?: string;
  /** Preselects "which robot"; the visitor can still change it. */
  interest?: QuoteInterest;
}

interface QuoteContextValue {
  /** null while the panel is closed. */
  target: QuoteTarget | null;
  openQuote: (target?: QuoteTarget) => void;
  closeQuote: () => void;
}

const QuoteContext = createContext<QuoteContextValue | null>(null);

/**
 * Opens the quote panel (QuoteDrawer) from anywhere: the navbar, a product's
 * button, the floating bar, the demo and installation panels.
 */
export default function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = useState<QuoteTarget | null>(null);

  const value = useMemo<QuoteContextValue>(
    () => ({
      target,
      openQuote: (next = {}) => setTarget(next),
      closeQuote: () => setTarget(null),
    }),
    [target]
  );

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export function useQuote(): QuoteContextValue {
  const ctx = useContext(QuoteContext);
  if (!ctx) {
    throw new Error("useQuote must be used within <QuoteProvider>");
  }
  return ctx;
}

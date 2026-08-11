"use client";

import { useTranslations } from "next-intl";
import { formatBaht } from "@/data/products";
import { siteConfig } from "@/data/siteConfig";

/**
 * Renders a price, or "Price on request" while the site is in quotation mode
 * (siteConfig.showPrices === false).
 *
 * Centralised so the two modes can never drift apart across the ~13 surfaces
 * that show money. Amounts are still passed in and still computed server-side —
 * this only decides whether the customer sees the number.
 */
export default function PriceOrQuote({
  amount,
  className = "",
  /** Applied instead of `className` when showing the quotation label, since a
   *  price style (mono, tabular-nums) reads badly on a sentence. */
  quoteClassName,
}: {
  amount: number;
  className?: string;
  quoteClassName?: string;
}) {
  const t = useTranslations("quotation");

  if (siteConfig.showPrices) {
    return <span className={className}>{formatBaht(amount)}</span>;
  }
  return <span className={quoteClassName ?? className}>{t("onRequest")}</span>;
}

/** True when the customer should see money at all. */
export const pricesVisible = siteConfig.showPrices;

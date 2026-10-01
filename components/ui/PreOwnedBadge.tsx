"use client";

import { useTranslations } from "next-intl";

/**
 * Marks a pre-owned (second-hand) robot. Shown wherever such a model appears
 * — cards, menus, its product page, the homepage banners — so the condition
 * is never something a buyer first hears on the sales call (business
 * decision, 2026-10-01). `tone` picks the light or the dark-surface style.
 */
export default function PreOwnedBadge({
  tone = "light",
  className = "",
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  const t = useTranslations("condition");
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-[0.14em] uppercase [&:lang(th)]:tracking-[0.02em] ${
        tone === "dark"
          ? "border border-white/30 bg-white/10 text-white"
          : "border border-forest-100 bg-surface text-content"
      } ${className}`}
    >
      {t("preOwned")}
    </span>
  );
}

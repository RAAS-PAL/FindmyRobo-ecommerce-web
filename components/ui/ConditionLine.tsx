"use client";

import { useTranslations } from "next-intl";
import type { StockCondition } from "@/data/conditions";

/**
 * How a robot is sold: one square label per way it is sold
 * ("Brand-new", "Pre-owned", or both). Square corners, so it reads as a
 * status on the card rather than a sentence under the name.
 */
export default function ConditionLine({
  conditions,
  tone = "light",
  stack = false,
  className = "",
}: {
  conditions: readonly StockCondition[];
  tone?: "light" | "dark";
  /** One box under the next, for the corner of a product photo. */
  stack?: boolean;
  className?: string;
}) {
  const t = useTranslations("condition");
  if (conditions.length === 0) return null;

  return (
    <ul className={`flex gap-1.5 ${stack ? "flex-col items-start" : "flex-wrap"} ${className}`}>
      {conditions.map((condition) => (
        <li key={condition}>
          <span
            className={`inline-flex items-center border px-2 py-1 font-mono text-[10px] leading-none font-semibold tracking-[0.12em] uppercase [&:lang(th)]:tracking-[0.02em] ${
              tone === "dark"
                ? "border-white/40 bg-white/10 text-white"
                : "border-forest-200 bg-surface text-content shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
            }`}
          >
            {condition === "new" ? t("new") : t("preOwned")}
          </span>
        </li>
      ))}
    </ul>
  );
}

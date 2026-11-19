"use client";

import { useTranslations } from "next-intl";
import type { StockCondition } from "@/data/conditions";

/**
 * How a robot is sold: one label per way it is sold ("Brand-new",
 * "Pre-owned", or both), in the Badge style.
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
            className={`inline-flex h-6 items-center rounded-control px-2 text-caption font-semibold ${
              tone === "dark" ? "bg-white/15 text-white" : "bg-forest-100 text-content"
            }`}
          >
            {condition === "new" ? t("new") : t("preOwned")}
          </span>
        </li>
      ))}
    </ul>
  );
}

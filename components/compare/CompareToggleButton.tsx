"use client";

import { ArrowLeftRight, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCompare } from "@/components/compare/CompareProvider";

/**
 * Product-detail compare control (PRD #30): adds/removes this robot from the
 * comparison selection, and once two or more robots are picked offers the jump
 * straight to the side-by-side page. Shares state with the floating launcher.
 */
export default function CompareToggleButton({ productId }: { productId: string }) {
  const t = useTranslations("compare.toggle");
  const { ids, count, canAdd, ready, has, toggle } = useCompare();

  const selected = has(productId);
  const blocked = !selected && !canAdd;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      <button
        type="button"
        onClick={() => toggle(productId)}
        disabled={blocked}
        aria-pressed={selected}
        title={blocked ? t("full") : undefined}
        className={`flex min-h-[40px] cursor-pointer items-center gap-2 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
          selected ? "text-gold-600 hover:text-content" : "text-ink-muted hover:text-gold-600"
        }`}
      >
        {selected ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
        )}
        {selected ? t("remove") : t("add")}
      </button>
      {ready && (
        <Link
          href={`/compare?ids=${ids.join(",")}`}
          className="text-[13px] font-bold text-gold-600 transition-colors hover:text-content"
        >
          {t("compareNow", { count })} →
        </Link>
      )}
    </div>
  );
}

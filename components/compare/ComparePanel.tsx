"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Plus, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useProducts } from "@/components/ProductsProvider";
import { useCompare, COMPARE_MAX } from "@/components/compare/CompareProvider";
import ProductVisual from "@/components/ui/ProductVisual";
import { SERVICE_CATEGORY } from "@/data/products";
import PriceOrQuote from "@/components/ui/PriceOrQuote";

/**
 * The robot picker behind the floating compare button (PRD #30): choose 2–3
 * robots, then jump to the side-by-side page. Selection state lives in
 * CompareProvider, so picks made here and on product pages stay in sync.
 */
export default function ComparePanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("compare.panel");
  const router = useRouter();
  const { products } = useProducts();
  const { ids, count, canAdd, ready, has, toggle, clear } = useCompare();

  const robots = products.filter((p) => p.category !== SERVICE_CATEGORY);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const compareNow = () => {
    if (!ready) return;
    onClose();
    router.push(`/compare?ids=${ids.join(",")}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-forest-950/50 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            aria-label={t("title")}
            className="fixed inset-x-4 top-1/2 z-[70] mx-auto max-w-md -translate-y-1/2 overflow-hidden rounded-card border border-forest-100 bg-surface shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-forest-100 px-5 py-4">
              <div>
                <h2 className="font-display text-lead font-bold text-content">
                  {t("title")}
                </h2>
                <p className="mt-0.5 text-caption text-ink-muted">{t("sub")}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t("close")}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-content transition-colors hover:bg-cloud"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="max-h-[46vh] overflow-y-auto p-3">
              {robots.map((robot) => {
                const selected = has(robot.id);
                const blocked = !selected && !canAdd;
                return (
                  <button
                    key={robot.id}
                    type="button"
                    onClick={() => toggle(robot.id)}
                    disabled={blocked}
                    aria-pressed={selected}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-control p-2.5 text-left transition-colors ${
                      selected
                        ? "bg-accent/15"
                        : blocked
                          ? "opacity-40"
                          : "hover:bg-cloud"
                    }`}
                  >
                    <span className="flex h-12 w-14 shrink-0 items-center justify-center overflow-hidden rounded-control bg-cloud p-1">
                      <ProductVisual product={robot} className="h-full w-full" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-small font-bold text-content">
                        {robot.name}
                      </span>
                      <PriceOrQuote
                        amount={robot.price}
                        className="block text-caption tabular-nums text-ink-muted"
                        quoteClassName="block text-caption font-semibold text-accent-600"
                      />
                    </span>
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        selected
                          ? "border-accent bg-accent text-on-accent"
                          : "border-forest-100 text-ink-muted"
                      }`}
                      aria-hidden="true"
                    >
                      {selected ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-3 border-t border-forest-100 bg-cloud/50 px-5 py-4">
              <div className="flex items-center justify-between text-caption text-ink-muted">
                <span>
                  {count === 0
                    ? t("empty")
                    : t("selectedCount", { count, max: COMPARE_MAX })}
                </span>
                {count > 0 && (
                  <button
                    type="button"
                    onClick={clear}
                    className="flex cursor-pointer items-center gap-1 font-semibold text-ink-muted transition-colors hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("clear")}
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={compareNow}
                disabled={!ready}
                className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-accent text-small font-bold text-on-accent transition-[background-color,transform] duration-150 ease-out hover:bg-accent-strong active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {ready ? t("compareNow") : t("needTwo")}
                {ready && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { OrderStatus } from "@/lib/checkout";

const OPTIONS: OrderStatus[] = [
  "pending_payment",
  "paid",
  "failed",
  "expired",
  "cancelled",
  "refunded",
];

/**
 * Manual status control on the order detail page. The gateway webhook remains
 * the source of truth for online payments — this is the lever for flows it can't
 * cover (bank-transfer confirmation, cancellations). Confirms before writing so
 * a stray click can't flip an order's money state.
 */
export default function OrderStatusControl({
  orderId,
  current,
}: {
  orderId: string;
  current: OrderStatus;
}) {
  const router = useRouter();
  const t = useTranslations("admin.orders");
  const [choice, setChoice] = useState<OrderStatus>(current);
  const [busy, setBusy] = useState(false);

  const dirty = choice !== current;

  const apply = async () => {
    if (!dirty) return;
    const confirmed = window.confirm(
      t("control.confirm", { status: t(`status.${choice}`) })
    );
    if (!confirmed) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: choice }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      window.alert(t("control.failed"));
    } catch {
      window.alert(t("control.network"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
      <label htmlFor="order-status" className="sr-only">
        {t("control.label")}
      </label>
      <select
        id="order-status"
        value={choice}
        disabled={busy}
        onChange={(e) => setChoice(e.target.value as OrderStatus)}
        className="min-h-[44px] flex-1 rounded-xl border border-forest-100 bg-surface px-4 text-[13.5px] font-semibold text-content transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 disabled:opacity-50"
      >
        {OPTIONS.map((status) => (
          <option key={status} value={status}>
            {t(`status.${status}`)}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={apply}
        disabled={!dirty || busy}
        className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-5 text-[13px] font-bold text-on-accent transition-all duration-300 hover:shadow-[0_0_28px_-4px_rgb(var(--accent-rgb)/0.65)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        {busy ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Check className="h-4 w-4" aria-hidden="true" />
        )}
        {t("control.apply")}
      </button>
    </div>
  );
}

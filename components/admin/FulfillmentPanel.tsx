"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import type { OrderFulfillment, ShippingCarrier } from "@/lib/checkout";

const CARRIERS: ShippingCarrier[] = ["EMS", "REG", "KND", "K2D", "KSD"];

/**
 * "Send to warehouse" control on the admin order detail page.
 *
 * Manual push to Sokochan: staff pick the carrier, then send. Once an order has
 * been sent (fulfillment.sokochanOrderCode present) this shows the shipment
 * details read-only instead of the send form. Disabled with a hint when the
 * order isn't paid or Sokochan isn't configured.
 */
export default function FulfillmentPanel({
  orderId,
  paid,
  configured,
  fulfillment,
}: {
  orderId: string;
  paid: boolean;
  configured: boolean;
  fulfillment?: OrderFulfillment;
}) {
  const router = useRouter();
  const t = useTranslations("admin.orders.fulfillment");
  const [carrier, setCarrier] = useState<ShippingCarrier>("KND");
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!window.confirm(t("confirm", { carrier: t(`carriers.${carrier}`) }))) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/fulfill`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carrier }),
      });
      const body = await res.json().catch(() => null);
      if (res.ok) {
        router.refresh();
        return;
      }
      window.alert(body?.error ?? t("failed"));
    } catch {
      window.alert(t("network"));
    } finally {
      setBusy(false);
    }
  };

  // Already sent — show the shipment record, not the form.
  if (fulfillment?.sokochanOrderCode) {
    return (
      <dl className="space-y-2.5 text-[13px]">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">{t("orderCode")}</dt>
          <dd className="font-mono text-[12px] text-content">
            {fulfillment.sokochanOrderCode}
          </dd>
        </div>
        {fulfillment.carrier && (
          <div className="flex justify-between gap-4">
            <dt className="text-ink-muted">{t("carrier")}</dt>
            <dd className="font-semibold text-content">{fulfillment.carrier}</dd>
          </div>
        )}
        {fulfillment.trackingNumber && (
          <div className="flex justify-between gap-4">
            <dt className="shrink-0 text-ink-muted">{t("tracking")}</dt>
            <dd className="font-mono text-[12px] text-content">
              {fulfillment.trackingNumber}
            </dd>
          </div>
        )}
      </dl>
    );
  }

  // Failed last attempt — surface the reason above the retry form.
  const errorNote = fulfillment?.error ? (
    <p className="mb-3 rounded-lg bg-red-500/10 px-3 py-2 text-[12.5px] text-red-600">
      {fulfillment.error}
    </p>
  ) : null;

  if (!configured) {
    return <p className="text-[13px] text-ink-muted">{t("notConfigured")}</p>;
  }
  if (!paid) {
    return <p className="text-[13px] text-ink-muted">{t("notPaid")}</p>;
  }

  return (
    <>
      {errorNote}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <label htmlFor="carrier" className="sr-only">
          {t("carrier")}
        </label>
        <select
          id="carrier"
          value={carrier}
          disabled={busy}
          onChange={(e) => setCarrier(e.target.value as ShippingCarrier)}
          className="min-h-[44px] flex-1 rounded-xl border border-forest-100 bg-surface px-4 text-[13.5px] font-semibold text-content transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 disabled:opacity-50"
        >
          {CARRIERS.map((c) => (
            <option key={c} value={c}>
              {t(`carriers.${c}`)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={send}
          disabled={busy}
          className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-5 text-[13px] font-bold text-on-accent transition-all duration-300 hover:shadow-[0_0_28px_-4px_rgb(var(--accent-rgb)/0.65)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {busy ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Truck className="h-4 w-4" aria-hidden="true" />
          )}
          {t("send")}
        </button>
      </div>
    </>
  );
}

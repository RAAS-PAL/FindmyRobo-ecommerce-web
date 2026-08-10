"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LoaderCircle, PackageSearch, Truck } from "lucide-react";
import { formatBaht } from "@/data/products";
import type { OrderLine, OrderStatus } from "@/lib/checkout";

const inputClass =
  "min-h-12 w-full rounded-xl border border-forest-100 bg-surface px-4 text-sm text-content placeholder:text-ink-muted/50 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25";

interface LookupResult {
  id: string;
  status: OrderStatus;
  createdAt: string;
  items: OrderLine[];
  total: number;
  shipping: { fullName: string; province: string };
  fulfillment?: {
    status?: string;
    trackingNumber?: string;
    carrier?: string;
  };
}

const statusTone: Record<OrderStatus, string> = {
  pending_payment: "bg-gold/20 text-gold-600",
  paid: "bg-forest-100 text-forest-700",
  failed: "bg-red-100 text-red-700",
  expired: "bg-forest-100 text-ink-muted",
  cancelled: "bg-forest-100 text-ink-muted",
  refunded: "bg-forest-100 text-ink-muted",
};

export default function OrderLookupForm() {
  const t = useTranslations("orderStatus");
  const ts = useTranslations("auth.account.status");
  const locale = useLocale();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<LookupResult | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setOrder(null);
    try {
      const response = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, email }),
      });
      const body = await response.json().catch(() => null);
      if (response.status === 429) throw new Error("rate_limited");
      if (!response.ok) throw new Error(body?.error ?? "server");
      setOrder(body.order as LookupResult);
    } catch (cause) {
      const key = cause instanceof Error ? cause.message : "server";
      setError(
        key === "not_found" || key === "rate_limited" ? t(`errors.${key}`) : t("errors.server")
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label
            htmlFor="lookup-order-id"
            className="mb-1.5 block text-[13px] font-semibold text-content"
          >
            {t("orderId")}
          </label>
          <input
            id="lookup-order-id"
            required
            autoComplete="off"
            placeholder={t("orderIdPlaceholder")}
            value={orderId}
            onChange={(e) => {
              setOrderId(e.target.value);
              setError(null);
            }}
            className={`${inputClass} font-mono uppercase`}
          />
          <p className="mt-1 text-[11.5px] text-ink-muted">{t("orderIdHint")}</p>
        </div>
        <div>
          <label
            htmlFor="lookup-email"
            className="mb-1.5 block text-[13px] font-semibold text-content"
          >
            {t("email")}
          </label>
          <input
            id="lookup-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            className={inputClass}
          />
        </div>
        {error && (
          <p role="alert" className="text-[12.5px] font-medium text-red-600">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy || !orderId.trim() || !email.trim()}
          className="flex min-h-[50px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gold text-[14px] font-bold text-forest-950 transition-all duration-300 hover:shadow-[0_0_28px_-4px_rgba(245,200,66,0.65)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <PackageSearch className="h-4 w-4" aria-hidden="true" />
          )}
          {t("submit")}
        </button>
      </form>

      {order && (
        <div
          aria-live="polite"
          className="rounded-2xl border border-forest-100 bg-surface p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-base font-bold text-content">{order.id}</p>
              <p className="mt-0.5 text-[12.5px] text-ink-muted">
                {new Date(order.createdAt).toLocaleDateString(
                  locale === "th" ? "th-TH" : "en-GB",
                  { year: "numeric", month: "long", day: "numeric" }
                )}
                {" · "}
                {order.shipping.fullName} · {order.shipping.province}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider ${statusTone[order.status]}`}
            >
              {ts(order.status)}
            </span>
          </div>

          {order.status === "pending_payment" && (
            <p className="mt-4 rounded-xl border border-gold bg-gold/10 p-3.5 text-[12.5px] leading-relaxed text-content">
              {t("pendingNote")}
            </p>
          )}

          {order.fulfillment?.trackingNumber && (
            <p className="mt-4 flex items-center gap-2 text-[13px] text-content">
              <Truck className="h-4 w-4 text-gold-600" aria-hidden="true" />
              <span className="font-semibold">{t("tracking")}</span>
              <span className="font-mono">{order.fulfillment.trackingNumber}</span>
              {order.fulfillment.carrier && (
                <span className="text-ink-muted">({order.fulfillment.carrier})</span>
              )}
            </p>
          )}

          <ul className="mt-5 divide-y divide-forest-100 border-t border-forest-100">
            {order.items.map((line) => (
              <li
                key={`${line.id}:${line.forId ?? ""}`}
                className="flex justify-between gap-4 py-3 text-sm"
              >
                <span className="text-content">
                  {line.name}
                  {line.forName && (
                    <span className="mt-0.5 block text-[11.5px] text-ink-muted">
                      ↳ {line.forName}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-ink-muted">×{line.qty}</span>
                <span className="shrink-0 font-medium text-content">
                  {formatBaht(line.qty * line.unitPrice)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex justify-between gap-4 border-t border-forest-100 pt-3 text-sm font-bold text-content">
            <span>{t("total")}</span>
            <span className="font-mono">{formatBaht(order.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

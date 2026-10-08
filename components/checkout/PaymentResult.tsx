"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight, CircleAlert, CircleCheck, LoaderCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { OrderStatus } from "@/lib/checkout";

/**
 * Landing page after a redirect payment (3-D Secure, wallets, banks).
 *
 * The redirect only means "the customer came back" — it does NOT mean paid.
 * The webhook is what settles the order, so this polls the order's real status
 * for a short window and reports whatever the server says.
 */

const POLL_MS = 2000;
const POLL_LIMIT = 15; // ~30s, then stop and let the customer refresh

export default function PaymentResult({
  orderId,
  initialStatus,
}: {
  orderId: string;
  initialStatus: OrderStatus;
}) {
  const t = useTranslations("payment.result");
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [tries, setTries] = useState(0);

  const settled = status === "paid" || status === "failed" || status === "expired";

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const body = await res.json();
      if (body?.status) setStatus(body.status as OrderStatus);
    } catch {
      // transient — the next tick retries
    }
  }, [orderId]);

  useEffect(() => {
    if (settled || tries >= POLL_LIMIT) return;
    const timer = setTimeout(() => {
      setTries((n) => n + 1);
      poll();
    }, POLL_MS);
    return () => clearTimeout(timer);
  }, [settled, tries, poll]);

  const paid = status === "paid";
  const pending = status === "pending_payment";

  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-forest-100 bg-surface p-8 text-center sm:p-12">
      <span
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
          paid ? "bg-accent/20" : pending ? "bg-forest-100" : "bg-red-100"
        }`}
      >
        {paid ? (
          <CircleCheck className="h-8 w-8 text-accent-600" aria-hidden="true" />
        ) : pending ? (
          <LoaderCircle className="h-7 w-7 animate-spin text-ink-muted" aria-hidden="true" />
        ) : (
          <CircleAlert className="h-8 w-8 text-red-600" aria-hidden="true" />
        )}
      </span>

      <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-content">
        {paid
          ? t("paidHeading")
          : pending
            ? t("pendingHeading")
            : t("failedHeading")}
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
        {paid
          ? t("paidBody", { orderId })
          : pending
            ? t("pendingBody", { orderId })
            : t("failedBody", { orderId })}
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {!paid && !pending && (
          <Link
            href="/checkout"
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-accent px-7 text-[14px] font-bold text-on-accent transition-all duration-300 hover:shadow-[0_0_28px_-4px_rgb(var(--accent-rgb)/0.65)]"
          >
            {t("tryAgain")}
          </Link>
        )}
        <Link
          href="/shop"
          className={`flex min-h-[48px] items-center justify-center gap-1.5 rounded-full px-7 text-[14px] font-bold transition-all duration-300 ${
            paid
              ? "bg-accent text-on-accent hover:shadow-[0_0_28px_-4px_rgb(var(--accent-rgb)/0.65)]"
              : "border border-forest-100 text-content hover:border-accent"
          }`}
        >
          {t("viewOrders")}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

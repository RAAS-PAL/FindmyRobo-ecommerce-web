"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LoaderCircle, RefreshCw, Smartphone } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { formatBaht } from "@/data/products";

/**
 * PromptPay step: request a QR for the order, show it, and wait.
 *
 * The QR is generated server-side (Omise source -> charge) and payment settles
 * asynchronously via the webhook — this component only polls the order's status
 * so the UI can move on when the bank confirms. A customer who closes the tab
 * still gets a correctly settled order; the poll is convenience, not truth.
 */
const POLL_MS = 3000;

export default function PromptPayForm({
  orderId,
  total,
}: {
  orderId: string;
  total: number;
}) {
  const t = useTranslations("payment");
  const locale = useLocale();
  const router = useRouter();
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const goToResult = useCallback(() => {
    router.push(`/checkout/return?order=${encodeURIComponent(orderId)}`);
  }, [orderId, router]);

  // Bumped by the retry button to re-run the request effect below.
  const [attempt, setAttempt] = useState(0);

  // Requests the QR on mount (and on each retry). State is only set from inside
  // the promise callbacks, and a cancelled flag stops a late response from
  // writing to an unmounted component — e.g. if the customer switches back to
  // the card tab while this is still in flight.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/checkout/promptpay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, locale }),
    })
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (cancelled) return;
        if (body?.status === "paid") {
          goToResult();
          return;
        }
        if (!res.ok || !body?.qrImage) {
          setError(body?.error ?? t("errors.promptpayFailed"));
          setLoading(false);
          return;
        }
        setQrImage(body.qrImage);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(t("errors.network"));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [attempt, orderId, locale, goToResult, t]);

  /** Retry resets the view, then re-runs the request effect. */
  const retry = () => {
    setError(null);
    setQrImage(null);
    setLoading(true);
    setAttempt((n) => n + 1);
  };

  // Poll only while a QR is on screen; any non-pending status ends the wait.
  useEffect(() => {
    if (!qrImage) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/orders/${encodeURIComponent(orderId)}/status`,
          { cache: "no-store" }
        );
        const body = await res.json().catch(() => null);
        if (body?.status && body.status !== "pending_payment") {
          clearInterval(timer);
          goToResult();
        }
      } catch {
        // transient network blip — keep polling
      }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [qrImage, orderId, goToResult]);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <LoaderCircle className="h-6 w-6 animate-spin text-gold-600" aria-hidden="true" />
        <p className="text-[13px] text-ink-muted">{t("promptpay.generating")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700"
        >
          {error}
        </p>
        <button
          type="button"
          onClick={retry}
          className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border-2 border-forest px-6 text-[14px] font-semibold text-content transition-colors hover:border-gold hover:text-gold-600"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          {t("promptpay.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-[13.5px] leading-relaxed text-ink-muted">
        {t("promptpay.instructions")}
      </p>

      {/* Omise-hosted QR. Plain <img>: the host is the payment provider's CDN and
          the URL is single-use, so there is nothing to optimize or cache. */}
      {qrImage && (
        <span className="mt-6 inline-flex items-center justify-center rounded-2xl border border-forest-100 bg-white p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrImage}
            alt={t("promptpay.qrAlt")}
            width={240}
            height={240}
            className="h-60 w-60 object-contain"
          />
        </span>
      )}

      <p className="mt-5 font-mono text-2xl font-semibold tabular-nums text-content">
        {formatBaht(total)}
      </p>

      <p className="mt-5 flex items-center gap-2 text-[12.5px] text-ink-muted">
        <LoaderCircle className="h-3.5 w-3.5 animate-spin text-gold-600" aria-hidden="true" />
        {t("promptpay.waiting")}
      </p>

      <p className="mt-4 flex items-start gap-2 text-left text-[12px] leading-relaxed text-ink-muted">
        <Smartphone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" aria-hidden="true" />
        {t("promptpay.keepOpen")}
      </p>
    </div>
  );
}

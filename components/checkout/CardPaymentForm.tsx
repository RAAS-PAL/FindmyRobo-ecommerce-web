"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Script from "next/script";
import { CreditCard, Info, LoaderCircle, Lock } from "lucide-react";
import { formatBaht } from "@/data/products";

/**
 * Card payment step.
 *
 * PCI: the card number/CVV are handed straight to Omise.js, which returns a
 * one-time token. Those fields are never put in React state, never sent to our
 * API, and never logged — our server only ever sees the token, which keeps us
 * at SAQ-A. Do not "simplify" this by posting the raw fields.
 */

interface OmiseTokenResponse {
  id: string;
  object: string;
}
interface OmiseJs {
  setPublicKey: (key: string) => void;
  createToken: (
    kind: "card",
    data: Record<string, string>,
    callback: (statusCode: number, response: OmiseTokenResponse & { message?: string }) => void
  ) => void;
}
declare global {
  interface Window {
    Omise?: OmiseJs;
  }
}

const inputClass =
  "min-h-[48px] w-full rounded-xl border border-forest-100 bg-surface px-4 text-[14px] text-content placeholder:text-ink-muted/60 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25";
const labelClass = "mb-1.5 block text-[13px] font-semibold text-content";

/** Digits only, grouped in 4s, for display. */
const formatCardNumber = (v: string) =>
  v.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();

export default function CardPaymentForm({
  orderId,
  total,
  publicKey,
}: {
  orderId: string;
  total: number;
  publicKey: string;
}) {
  const t = useTranslations("payment");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Card fields are deliberately uncontrolled: their values live only in the
  // DOM until Omise.js reads them, so they never enter app state.
  const formRef = useRef<HTMLFormElement>(null);
  const [numberDisplay, setNumberDisplay] = useState("");
  const [expiryDisplay, setExpiryDisplay] = useState("");

  useEffect(() => {
    if (ready && window.Omise) window.Omise.setPublicKey(publicKey);
  }, [ready, publicKey]);

  const tokenize = (): Promise<string> =>
    new Promise((resolve, reject) => {
      const form = formRef.current;
      if (!form || !window.Omise) return reject(new Error(t("errors.notReady")));

      const get = (name: string) =>
        (form.elements.namedItem(name) as HTMLInputElement | null)?.value ?? "";

      const [month, year] = get("expiry").split("/");
      window.Omise.createToken(
        "card",
        {
          name: get("holder").trim(),
          number: get("number").replace(/\s/g, ""),
          expiration_month: (month ?? "").trim(),
          expiration_year: `20${(year ?? "").trim()}`.slice(-4),
          security_code: get("cvc").trim(),
        },
        (status, response) => {
          if (status === 200 && response.id) resolve(response.id);
          else reject(new Error(response.message || t("errors.cardRejected")));
        }
      );
    });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const token = await tokenize();
      const res = await fetch("/api/checkout/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, token }),
      });
      const body = await res.json().catch(() => null);

      if (body?.status === "redirect" && body.authorizeUri) {
        // 3-D Secure — hand off to the bank; we come back to /checkout/return.
        window.location.href = body.authorizeUri;
        return;
      }
      if (!res.ok || body?.status !== "paid") {
        setError(body?.error ?? t("errors.declined"));
        setBusy(false);
        return;
      }
      window.location.href = `/checkout/return?order=${encodeURIComponent(orderId)}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.declined"));
      setBusy(false);
    }
  };

  return (
    <>
      {/* must load from Omise's CDN, not npm — that is what keeps card data
          off our origin and us out of PCI scope */}
      <Script
        src="https://cdn.omise.co/omise.js"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
      />

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700"
          >
            {error}
          </p>
        )}

        <div>
          <label htmlFor="holder" className={labelClass}>
            {t("cardHolder")}
          </label>
          <input id="holder" name="holder" autoComplete="cc-name" required className={inputClass} />
        </div>

        <div>
          <label htmlFor="number" className={labelClass}>
            {t("cardNumber")}
          </label>
          <input
            id="number"
            name="number"
            inputMode="numeric"
            autoComplete="cc-number"
            required
            placeholder="4242 4242 4242 4242"
            value={numberDisplay}
            onChange={(e) => setNumberDisplay(formatCardNumber(e.target.value))}
            className={`${inputClass} font-mono tracking-wide`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiry" className={labelClass}>
              {t("cardExpiry")}
            </label>
            <input
              id="expiry"
              name="expiry"
              inputMode="numeric"
              autoComplete="cc-exp"
              required
              placeholder="MM/YY"
              value={expiryDisplay}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                setExpiryDisplay(
                  digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
                );
              }}
              className={`${inputClass} font-mono`}
            />
          </div>
          <div>
            <label htmlFor="cvc" className={labelClass}>
              {t("cardCvc")}
            </label>
            <input
              id="cvc"
              name="cvc"
              inputMode="numeric"
              autoComplete="cc-csc"
              required
              maxLength={4}
              placeholder="123"
              className={`${inputClass} font-mono`}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={busy || !ready}
          className="flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gold text-[15px] font-bold text-forest-950 transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_32px_-6px_rgba(245,200,66,0.7)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          {busy ? (
            <LoaderCircle className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
          ) : (
            <>
              <CreditCard className="h-4.5 w-4.5" aria-hidden="true" />
              {t("payAmount", { amount: formatBaht(total) })}
            </>
          )}
        </button>

        <p className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-muted">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" aria-hidden="true" />
          {t("securityNote")}
        </p>
        {!ready && (
          <p className="flex items-center gap-2 text-[12px] text-ink-muted">
            <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {t("loading")}
          </p>
        )}
      </form>
    </>
  );
}

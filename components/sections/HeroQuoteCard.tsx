"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, LoaderCircle, X } from "lucide-react";
import {
  EMPTY_SHIPPING,
  validateShipping,
  type ShippingField,
  type ShippingInfo,
} from "@/lib/checkout";

const inputClass = (hasError: boolean) =>
  `min-h-11 w-full rounded-xl border bg-cloud px-3.5 text-base text-content transition-colors focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-400 focus:ring-red-200"
      : "border-forest-100 focus:border-gold focus:ring-gold/30"
  }`;

function Field({
  id,
  label,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  optional?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-content">
        {label}
        {!optional && (
          <span className="ml-0.5 text-gold-600" aria-hidden="true">
            *
          </span>
        )}
        {optional && (
          <span className="ml-1.5 font-normal text-ink-muted">({optional})</span>
        )}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-[12px] font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Compact quotation card pinned to the left of the hero. Only the name field
 * shows until the visitor focuses it — then the card grows to the full form
 * (phone and email, then the address) without leaving the banner.
 */
export default function HeroQuoteCard() {
  const t = useTranslations("heroQuote");
  const tc = useTranslations("checkout");
  const tq = useTranslations("quotation");
  const locale = useLocale();
  const formId = useId();
  const rootRef = useRef<HTMLFormElement>(null);

  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState<ShippingInfo>(EMPTY_SHIPPING);
  const [errors, setErrors] = useState<Partial<Record<ShippingField, string>>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const fieldId = (name: ShippingField) => `${formId}-${name}`;

  useEffect(() => {
    if (!expanded) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setExpanded(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded]);

  const setField =
    (name: ShippingField) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setForm((current) => ({ ...current, [name]: value }));
      setErrors((current) => {
        if (!current[name]) return current;
        const next = { ...current };
        delete next[name];
        return next;
      });
    };

  const err = (name: ShippingField) =>
    errors[name] ? tc(`errors.${errors[name]}`) : undefined;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors = validateShipping(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setExpanded(true);
      const first = Object.keys(nextErrors)[0] as ShippingField;
      document.getElementById(fieldId(first))?.focus();
      return;
    }

    setBusy(true);
    setSendError(null);
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipping: form, locale }),
      });
      if (response.status === 429) {
        setSendError(t("rateLimited"));
        return;
      }
      if (!response.ok) {
        setSendError(t("sendError"));
        return;
      }
      setSent(true);
    } catch {
      setSendError(t("sendError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      ref={rootRef}
      onSubmit={onSubmit}
      onFocus={() => setExpanded(true)}
      aria-expanded={expanded}
      aria-label={t("eyebrow")}
      className={`z-20 max-w-[calc(100vw-2rem)] shrink-0 self-start text-left transition-[width] duration-300 ease-out motion-reduce:transition-none lg:self-center ${
        expanded ? "w-[min(26.5rem,calc(100vw-2rem))]" : "w-[17.5rem]"
      }`}
    >
      <div
        className={`overflow-hidden rounded-2xl border border-white/70 bg-surface/95 shadow-[0_22px_50px_-24px_rgba(10,10,11,0.55)] backdrop-blur-md ${
          expanded ? "max-h-[calc(100svh-6.5rem)] overflow-y-auto" : ""
        }`}
      >
        <div className="h-1 bg-gold" aria-hidden="true" />
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-gold-600">
                {t("eyebrow")}
              </p>
              {expanded && !sent && (
                <p className="mt-1.5 text-[13px] leading-snug text-ink-muted">{t("sub")}</p>
              )}
            </div>
            {expanded && (
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-cloud hover:text-content"
                aria-label={t("close")}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {sent ? (
            <p className="mt-4 text-[14px] leading-relaxed text-content" role="status">
              <span className="block font-display text-lg font-bold">{t("successTitle")}</span>
              <span className="mt-1.5 block text-ink-muted">
                {t("successBody", { name: form.fullName.trim(), phone: form.phone.trim() })}
              </span>
            </p>
          ) : (
            <>
              <div className="mt-3.5">
                <Field id={fieldId("fullName")} label={tc("fullName")} error={err("fullName")}>
                  <input
                    id={fieldId("fullName")}
                    name="fullName"
                    autoComplete="name"
                    value={form.fullName}
                    onChange={setField("fullName")}
                    className={inputClass(!!errors.fullName)}
                  />
                </Field>
              </div>

              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                  expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden" inert={expanded ? undefined : true}>
                  <div className="mt-3.5 grid grid-cols-2 gap-3.5">
                    <Field id={fieldId("phone")} label={tc("phone")} error={err("phone")}>
                      <input
                        id={fieldId("phone")}
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="08x-xxx-xxxx"
                        value={form.phone}
                        onChange={setField("phone")}
                        className={inputClass(!!errors.phone)}
                      />
                    </Field>
                    <Field id={fieldId("email")} label={tc("email")} error={err("email")}>
                      <input
                        id={fieldId("email")}
                        name="email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        value={form.email}
                        onChange={setField("email")}
                        className={inputClass(!!errors.email)}
                      />
                    </Field>
                    <div className="col-span-2">
                      <Field id={fieldId("address")} label={tc("address")} error={err("address")}>
                        <input
                          id={fieldId("address")}
                          name="address"
                          autoComplete="street-address"
                          value={form.address}
                          onChange={setField("address")}
                          className={inputClass(!!errors.address)}
                        />
                      </Field>
                    </div>
                    <Field id={fieldId("district")} label={tc("district")} error={err("district")}>
                      <input
                        id={fieldId("district")}
                        name="district"
                        autoComplete="address-level2"
                        value={form.district}
                        onChange={setField("district")}
                        className={inputClass(!!errors.district)}
                      />
                    </Field>
                    <Field id={fieldId("province")} label={tc("province")} error={err("province")}>
                      <input
                        id={fieldId("province")}
                        name="province"
                        autoComplete="address-level1"
                        value={form.province}
                        onChange={setField("province")}
                        className={inputClass(!!errors.province)}
                      />
                    </Field>
                    <Field
                      id={fieldId("postalCode")}
                      label={tc("postalCode")}
                      error={err("postalCode")}
                    >
                      <input
                        id={fieldId("postalCode")}
                        name="postalCode"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        maxLength={5}
                        value={form.postalCode}
                        onChange={setField("postalCode")}
                        className={inputClass(!!errors.postalCode)}
                      />
                    </Field>
                    <div className="col-span-2">
                      <Field
                        id={fieldId("note")}
                        label={tc("note")}
                        optional={tc("optional")}
                      >
                        <input
                          id={fieldId("note")}
                          name="note"
                          placeholder={tc("notePlaceholder")}
                          value={form.note}
                          onChange={setField("note")}
                          className={inputClass(false)}
                        />
                      </Field>
                    </div>
                  </div>

                  {sendError && (
                    <p role="alert" className="mt-3 text-[13px] font-medium text-red-600">
                      {sendError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="mt-4 flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gold text-[15px] font-bold text-forest-950 transition-colors hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                        {t("sending")}
                      </>
                    ) : (
                      <>
                        {tq("submitCta")}
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {!expanded && (
                <p className="mt-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                  {t("steps")}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </form>
  );
}

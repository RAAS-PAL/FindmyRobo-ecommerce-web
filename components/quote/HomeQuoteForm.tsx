"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, CheckCheck, ChefHat, ClipboardCheck,
  Leaf, LoaderCircle, ShieldCheck, Sparkles, Truck, Wrench,
} from "lucide-react";
import { useProducts } from "@/components/ProductsProvider";
import { productLabel, SERVICE_CATEGORY } from "@/data/products";
import {
  CATEGORY_INTEREST, EMPTY_QUOTE, PUDU_VENUES, QUOTE_INTERESTS,
  QUOTE_NOTE_MAX, validateQuote, type QuoteField, type QuoteRequest,
} from "@/lib/quoteRequest";
import { submitQuote } from "@/lib/submitQuote";

const INTEREST_ICONS = {
  "lawn-mowing": Leaf,
  "commercial-cleaning": Sparkles,
  "smart-equipment": Wrench,
  cooking: ChefHat,
  "pudu-delivery": Truck,
};
const CONTACT_FIELDS: QuoteField[] = ["fullName", "email", "phone"];
const fieldClass =
  "h-12 w-full rounded-lg border bg-surface px-3.5 text-base text-content placeholder:text-ink-muted/65 transition-colors focus-visible:outline-none! focus-visible:ring-2 focus-visible:ring-accent/25 sm:text-[15px]";
const buttonClass =
  "inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent-gradient px-6 text-[15px] font-semibold focus-visible:outline-none! focus-visible:ring-4 focus-visible:ring-accent/25 disabled:cursor-wait disabled:opacity-60";

function Field({
  id, label, error, optional, children,
}: {
  id: string;
  label: string;
  error?: string;
  optional?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-2 block text-[13px] font-semibold text-content">
        {label}
        {optional && <span className="ml-1 font-normal text-ink-muted">({optional})</span>}
      </label>
      {children}
      {error && <p id={id + "-error"} className="mt-1.5 text-[13px] text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

/** Homepage enquiry: project first, contact second. Closing preserves this state. */
export default function HomeQuoteForm({
  interest, productId, active,
}: {
  interest?: QuoteRequest["interest"];
  productId?: string;
  active: boolean;
}) {
  const t = useTranslations("heroQuote");
  const tc = useTranslations("checkout");
  const tq = useTranslations("quotation");
  const tcond = useTranslations("condition");
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const { getProduct } = useProducts();
  const product = productId ? getProduct(productId) : undefined;
  const sold = product && product.category !== SERVICE_CATEGORY ? product : undefined;
  const needsCondition = !!sold && sold.conditions.length > 1;
  const uid = useId();
  const rootRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const pendingFocus = useRef<QuoteField | "heading" | null>(null);
  const submitting = useRef(false);
  const [step, setStep] = useState<0 | 1>(0);
  const [form, setForm] = useState<QuoteRequest>(() => ({
    ...EMPTY_QUOTE,
    productId: product?.id ?? "",
    interest: (product && CATEGORY_INTEREST[product.category]) || interest || "",
    condition: sold?.conditions.length === 1 ? sold.conditions[0] : "",
  }));
  const [errors, setErrors] = useState<Partial<Record<QuoteField, string>>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<"rateLimited" | "sendError" | null>(null);

  const id = (field: QuoteField) => uid + "-" + field;
  const errorText = (field: QuoteField) => {
    const key = errors[field];
    if (!key) return undefined;
    return key === "area" || key === "count" ? t("errors." + key) : tc("errors." + key);
  };
  const inputProps = (field: QuoteField) => ({
    id: id(field),
    name: field,
    value: form[field],
    "aria-invalid": !!errors[field],
    "aria-describedby": errors[field] ? id(field) + "-error" : undefined,
    className: fieldClass + (errors[field] ? " border-red-400" : " border-forest-100 focus-visible:border-accent-600"),
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setForm((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
      setSendError(null);
    },
  });

  // Focus a heading, not an input: opening never summons a phone keyboard.
  useEffect(() => {
    if (!active) return;
    const frame = requestAnimationFrame(() => {
      const focus = pendingFocus.current;
      if (focus && focus !== "heading") {
        rootRef.current?.querySelector<HTMLElement>('[name="' + focus + '"]')?.focus();
      } else {
        headingRef.current?.focus({ preventScroll: true });
      }
      pendingFocus.current = null;
    });
    return () => cancelAnimationFrame(frame);
  }, [active, step, sent]);

  const goBack = () => {
    pendingFocus.current = "heading";
    setStep(0);
    setSendError(null);
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const allErrors = validateQuote(form, { productChosen: !!product, needsCondition });
    const visibleErrors = Object.fromEntries(
      Object.entries(allErrors).filter(([field]) => step === 1 || !CONTACT_FIELDS.includes(field as QuoteField))
    ) as Partial<Record<QuoteField, string>>;
    setErrors(visibleErrors);
    const first = Object.keys(visibleErrors)[0] as QuoteField | undefined;
    if (first) {
      if (step === 1 && !CONTACT_FIELDS.includes(first)) {
        pendingFocus.current = first;
        setStep(0);
      } else {
        rootRef.current?.querySelector<HTMLElement>('[name="' + first + '"]')?.focus();
      }
      return;
    }
    if (step === 0) {
      pendingFocus.current = "heading";
      setStep(1);
      return;
    }
    submitting.current = true;
    setBusy(true);
    setSendError(null);
    const result = await submitQuote(form, locale);
    submitting.current = false;
    setBusy(false);
    if (result === "sent") setSent(true);
    else setSendError(result);
  }

  return (
    <form ref={rootRef} onSubmit={onSubmit} noValidate aria-label={t("eyebrow")} aria-busy={busy}>
      {sent ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8">
          <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-50 text-accent-600">
            <CheckCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <h3 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-bold text-content focus:outline-none">
            {t("successTitle")}
          </h3>
          <p role="status" className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-muted">
            {t("successBody", { name: form.fullName.trim(), phone: form.phone.trim() })}
          </p>
          <p className="mt-6 border-t border-forest-100 pt-5 text-sm text-ink-muted">{t("consultation.successNext")}</p>
        </motion.div>
      ) : (
        <>
          <ol aria-label={t("consultation.progressLabel")} className="mb-6 grid grid-cols-2 gap-4">
            {(["project", "contact"] as const).map((name, index) => (
              <li key={name} aria-current={step === index ? "step" : undefined}
                className={"border-t-2 pt-3 text-[13px] font-semibold " + (step >= index ? "border-accent text-accent-600" : "border-forest-100 text-ink-muted")}>
                <span className="mr-2 inline-flex w-5 justify-center font-mono text-xs" aria-hidden="true">
                  {step > index ? <Check className="h-4 w-4" /> : "0" + (index + 1)}
                </span>
                {t("consultation.steps." + name)}
              </li>
            ))}
          </ol>

          <motion.div key={step} initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.24 }}>
            <h3 ref={headingRef} tabIndex={-1} className="font-display text-[23px] leading-tight font-bold tracking-tight text-content focus:outline-none">
              {t(step === 0 ? "consultation.projectTitle" : "consultation.contactTitle")}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
              {t(step === 0 ? "consultation.projectHint" : "consultation.contactHint")}
            </p>

            <fieldset disabled={busy} className="mt-5 space-y-5">
              <legend className="sr-only">{t("consultation.steps." + (step === 0 ? "project" : "contact"))}</legend>
              {step === 0 ? (
                <>
                  {product ? (
                    <div className="flex items-center gap-3 rounded-lg border border-forest-100 bg-cloud/60 p-4">
                      <ClipboardCheck className="h-5 w-5 shrink-0 text-accent-600" aria-hidden="true" />
                      <div>
                        <p className="text-xs text-ink-muted">{t("selectionLabel")}</p>
                        <p className="mt-1 text-[15px] font-semibold text-content">{productLabel(product)}</p>
                      </div>
                    </div>
                  ) : (
                    <fieldset aria-describedby={errors.interest ? id("interest") + "-error" : undefined}>
                      <legend className="sr-only">{t("interestLabel")}</legend>
                      <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
                        {QUOTE_INTERESTS.map((value) => {
                          const Icon = INTEREST_ICONS[value];
                          return (
                            <label key={value} className="relative cursor-pointer">
                              <input type="radio" name="interest" value={value} checked={form.interest === value}
                                onChange={() => {
                                  setForm((current) => ({ ...current, interest: value }));
                                  setErrors({});
                                }}
                                aria-describedby={errors.interest ? id("interest") + "-error" : undefined}
                                className="peer sr-only" />
                              <span className="flex min-h-14 items-center gap-2.5 rounded-lg border border-forest-100 px-3 py-2.5 text-[13px] font-medium text-content transition-colors hover:border-accent-600/50 peer-checked:border-accent-600 peer-checked:bg-accent-50 peer-checked:text-accent-600 peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40 peer-focus-visible:ring-offset-2">
                                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                <span className="flex-1">{t("interests." + value)}</span>
                                <span className={"flex h-4 w-4 shrink-0 items-center justify-center rounded-full border " + (form.interest === value ? "border-accent bg-accent text-on-accent" : "border-forest-300")} aria-hidden="true">
                                  {form.interest === value && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      {errors.interest && <p id={id("interest") + "-error"} role="alert" className="mt-2 text-[13px] text-red-600 dark:text-red-400">{errorText("interest")}</p>}
                    </fieldset>
                  )}

                  {needsCondition && (
                    <fieldset>
                      <legend className="mb-2 text-[13px] font-semibold text-content">{tcond("ask")}</legend>
                      <div className="flex flex-wrap gap-4">
                        {sold.conditions.map((condition) => (
                          <label key={condition} className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-content">
                            <input type="radio" name="condition" value={condition} checked={form.condition === condition}
                              onChange={() => {
                                setForm((current) => ({ ...current, condition }));
                                setErrors((current) => ({ ...current, condition: undefined }));
                              }}
                              aria-describedby={errors.condition ? id("condition") + "-error" : undefined}
                              className="h-4 w-4 accent-accent" />
                            {tcond(condition === "new" ? "new" : "preOwned")}
                          </label>
                        ))}
                      </div>
                      {errors.condition && <p id={id("condition") + "-error"} role="alert" className="text-[13px] text-red-600 dark:text-red-400">{errorText("condition")}</p>}
                    </fieldset>
                  )}

                  {form.interest === "lawn-mowing" && (
                    <Field id={id("areaM2")} label={t("areaLabel")} error={errorText("areaM2")}>
                      <div className="relative">
                        <input {...inputProps("areaM2")} inputMode="decimal" placeholder={t("areaPlaceholder")} required
                          className={inputProps("areaM2").className + " pr-14"} />
                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-ink-muted">m²</span>
                      </div>
                    </Field>
                  )}
                  {form.interest === "pudu-delivery" && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Field id={id("venue")} label={t("venueLabel")} error={errorText("venue")}>
                          <select {...inputProps("venue")} required>
                            <option value="">{t("venuePlaceholder")}</option>
                            {PUDU_VENUES.map((value) => <option key={value} value={value}>{t("venues." + value)}</option>)}
                          </select>
                        </Field>
                      </div>
                      <Field id={id("servingCount")} label={t("servingLabel")} error={errorText("servingCount")}>
                        <input {...inputProps("servingCount")} inputMode="numeric" placeholder={t("servingPlaceholder")} required />
                      </Field>
                      <Field id={id("floors")} label={t("floorsLabel")} error={errorText("floors")}>
                        <input {...inputProps("floors")} inputMode="numeric" placeholder={t("floorsPlaceholder")} required />
                      </Field>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 border-b border-forest-100 pb-4 text-sm text-ink-muted">
                    <Check className="h-4 w-4 shrink-0 text-accent-600" aria-hidden="true" />
                    <span className="min-w-0 flex-1">{product ? productLabel(product) : t("interests." + form.interest)}</span>
                    <button type="button" onClick={goBack} className="min-h-10 cursor-pointer px-2 font-semibold text-accent-600 underline-offset-4 hover:underline">
                      {t("consultation.edit")}
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field id={id("fullName")} label={tc("fullName")} error={errorText("fullName")}>
                      <input {...inputProps("fullName")} autoComplete="name" placeholder={t("consultation.namePlaceholder")} required />
                    </Field>
                    <Field id={id("phone")} label={tc("phone")} error={errorText("phone")}>
                      <input {...inputProps("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="081 234 5678" required />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field id={id("email")} label={tc("email")} error={errorText("email")}>
                        <input {...inputProps("email")} type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" required />
                      </Field>
                    </div>
                  </div>
                  <details className="group rounded-lg border border-forest-100">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 text-[13px] font-medium text-ink-muted">
                      {t("consultation.extraDetails")}
                      <span aria-hidden="true" className="text-lg group-open:hidden">+</span>
                      <span aria-hidden="true" className="hidden text-lg group-open:inline">−</span>
                    </summary>
                    <div className="space-y-4 border-t border-forest-100 p-4">
                      <Field id={id("company")} label={t("companyLabel")} optional={tc("optional")}>
                        <input {...inputProps("company")} autoComplete="organization" />
                      </Field>
                      <Field id={id("note")} label={t("noteLabel")} optional={tc("optional")}>
                        <textarea {...inputProps("note")} rows={3} maxLength={QUOTE_NOTE_MAX} placeholder={t("notePlaceholder")}
                          className={fieldClass + " min-h-24 resize-y border-forest-100 py-3 focus-visible:border-accent-600"} />
                      </Field>
                    </div>
                  </details>
                </>
              )}
            </fieldset>

            {sendError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{t(sendError)}</p>}
            <div className="mt-6 flex items-center gap-3">
              {step === 1 && (
                <button type="button" onClick={goBack} disabled={busy}
                  className="inline-flex min-h-12 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-ink-muted hover:text-content disabled:opacity-50">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />{t("consultation.back")}
                </button>
              )}
              <button type="submit" disabled={busy} className={buttonClass + " flex-1"}>
                {busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                {busy ? t("sending") : step === 0 ? t("consultation.continue") : tq("submitCta")}
                {!busy && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs leading-relaxed text-ink-muted">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {t(step === 0 ? "consultation.noCommitment" : "consultation.privacy")}
            </p>
          </motion.div>
        </>
      )}
    </form>
  );
}

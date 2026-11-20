"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Check, LoaderCircle } from "lucide-react";
import { useProducts } from "@/components/ProductsProvider";
import { productLabel, SERVICE_CATEGORY } from "@/data/products";
import {
  CATEGORY_INTEREST, EMPTY_QUOTE, PUDU_VENUES, QUOTE_INTERESTS,
  QUOTE_NOTE_MAX, validateQuote, type QuoteField, type QuoteRequest,
} from "@/lib/quoteRequest";
import { submitQuote } from "@/lib/submitQuote";
import { buttonClass } from "@/components/ui/Button";
import { fieldAreaClass, fieldControlClass, fieldErrorClass, fieldLabelClass } from "@/components/ui/Field";
import { FADE } from "@/lib/motion";

const CONTACT_FIELDS: QuoteField[] = ["fullName", "email", "phone"];
const submitClass = buttonClass({ size: "lg", className: "flex-1 gap-2 disabled:cursor-wait" });

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
      <label htmlFor={id} className={fieldLabelClass}>
        {label}
        {optional && <span className="ml-1 font-normal text-ink-muted">({optional})</span>}
      </label>
      {children}
      {error && <p id={id + "-error"} className={fieldErrorClass}>{error}</p>}
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
    className: fieldControlClass,
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
          <h3 ref={headingRef} tabIndex={-1} className="font-display text-heading text-content focus:outline-none">
            {t("successTitle")}
          </h3>
          <p role="status" className="mt-3 max-w-md text-body text-ink-muted">
            {t("successBody", { name: form.fullName.trim(), phone: form.phone.trim() })}
          </p>
          <p className="mt-6 border-t border-forest-100 pt-5 text-small text-ink-muted">{t("consultation.successNext")}</p>
        </motion.div>
      ) : (
        <>
          <ol aria-label={t("consultation.progressLabel")} className="mb-6 grid grid-cols-2 gap-4">
            {(["project", "contact"] as const).map((name, index) => (
              <li key={name} aria-current={step === index ? "step" : undefined}
                className={"border-t-2 pt-3 text-small font-semibold" + (step >= index ? "border-accent text-content" : "border-forest-100 text-ink-muted")}>
                <span className="mr-2 inline-flex w-4 justify-center tabular-nums" aria-hidden="true">
                  {step > index ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                {t("consultation.steps." + name)}
              </li>
            ))}
          </ol>

          <motion.div key={step} initial={{ opacity: reduceMotion ? 1 : 0 }}
            animate={{ opacity: 1 }} transition={reduceMotion ? { duration: 0 } : FADE}>
            <h3 ref={headingRef} tabIndex={-1} className="font-display text-heading text-content focus:outline-none">
              {t(step === 0 ? "consultation.projectTitle" : "consultation.contactTitle")}
            </h3>
            <p className="mt-2 text-small text-ink-muted">
              {t(step === 0 ? "consultation.projectHint" : "consultation.contactHint")}
            </p>

            <fieldset disabled={busy} className="mt-5 space-y-5">
              <legend className="sr-only">{t("consultation.steps." + (step === 0 ? "project" : "contact"))}</legend>
              {step === 0 ? (
                <>
                  {product ? (
                    <div className="rounded-control border border-forest-100 bg-cloud/60 p-4">
                      <div>
                        <p className="text-caption text-ink-muted">{t("selectionLabel")}</p>
                        <p className="mt-1 text-body font-semibold text-content">{productLabel(product)}</p>
                      </div>
                    </div>
                  ) : (
                    <fieldset aria-describedby={errors.interest ? id("interest") + "-error" : undefined}>
                      <legend className="sr-only">{t("interestLabel")}</legend>
                      <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
                        {QUOTE_INTERESTS.map((value) => {
                          return (
                            <label key={value} className="relative cursor-pointer">
                              <input type="radio" name="interest" value={value} checked={form.interest === value}
                                onChange={() => {
                                  setForm((current) => ({ ...current, interest: value }));
                                  setErrors({});
                                }}
                                aria-describedby={errors.interest ? id("interest") + "-error" : undefined}
                                className="peer sr-only" />
                              <span className="flex min-h-12 items-center gap-2.5 rounded-control border border-forest-100 px-3 py-2.5 text-small font-medium text-content transition-colors hover:border-accent-600/50 peer-checked:border-accent-600 peer-checked:bg-accent-50 peer-checked:text-accent-600 peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40 peer-focus-visible:ring-offset-2">
                                <span className="flex-1">{t("interests." + value)}</span>
                                <span className={"flex h-4 w-4 shrink-0 items-center justify-center rounded-full border" + (form.interest === value ? "border-accent bg-accent text-on-accent" : "border-forest-300")} aria-hidden="true">
                                  {form.interest === value && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      {errors.interest && <p id={id("interest") + "-error"} role="alert" className={fieldErrorClass}>{errorText("interest")}</p>}
                    </fieldset>
                  )}

                  {needsCondition && (
                    <fieldset>
                      <legend className={fieldLabelClass}>{tcond("ask")}</legend>
                      <div className="flex flex-wrap gap-4">
                        {sold.conditions.map((condition) => (
                          <label key={condition} className="flex min-h-11 cursor-pointer items-center gap-2 text-small text-content">
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
                      {errors.condition && <p id={id("condition") + "-error"} role="alert" className={fieldErrorClass}>{errorText("condition")}</p>}
                    </fieldset>
                  )}

                  {form.interest === "lawn-mowing" && (
                    <Field id={id("areaM2")} label={t("areaLabel")} error={errorText("areaM2")}>
                      <div className="relative">
                        <input {...inputProps("areaM2")} inputMode="decimal" placeholder={t("areaPlaceholder")} required
                          className={inputProps("areaM2").className + " pr-14"} />
                        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-small text-ink-muted">m²</span>
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
                  <div className="flex items-center gap-2 border-b border-forest-100 pb-4 text-small text-ink-muted">
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
                  <details className="group rounded-control border border-forest-100">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 text-small font-medium text-ink-muted">
                      {t("consultation.extraDetails")}
                      <span aria-hidden="true" className="text-lead group-open:hidden">+</span>
                      <span aria-hidden="true" className="hidden text-lead group-open:inline">−</span>
                    </summary>
                    <div className="space-y-4 border-t border-forest-100 p-4">
                      <Field id={id("company")} label={t("companyLabel")} optional={tc("optional")}>
                        <input {...inputProps("company")} autoComplete="organization" />
                      </Field>
                      <Field id={id("note")} label={t("noteLabel")} optional={tc("optional")}>
                        <textarea {...inputProps("note")} rows={3} maxLength={QUOTE_NOTE_MAX} placeholder={t("notePlaceholder")}
                          className={fieldAreaClass + " resize-y"} />
                      </Field>
                    </div>
                  </details>
                </>
              )}
            </fieldset>

            {sendError && <p role="alert" className="mt-4 rounded-control bg-red-50 p-3 text-small text-red-700 dark:bg-red-950/30 dark:text-red-300">{t(sendError)}</p>}
            <div className="mt-6 flex items-center gap-3">
              {step === 1 && (
                <button type="button" onClick={goBack} disabled={busy}
                  className="inline-flex min-h-12 cursor-pointer items-center gap-1.5 rounded-control px-2 text-small font-semibold text-ink-muted transition-colors duration-150 hover:text-content disabled:opacity-50">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />{t("consultation.back")}
                </button>
              )}
              <button type="submit" disabled={busy} className={submitClass}>
                {busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                {busy ? t("sending") : step === 0 ? t("consultation.continue") : tq("submitCta")}
              </button>
            </div>
            <p className="mt-3 text-center text-caption text-ink-muted">
              {t(step === 0 ? "consultation.noCommitment" : "consultation.privacy")}
            </p>
          </motion.div>
        </>
      )}
    </form>
  );
}

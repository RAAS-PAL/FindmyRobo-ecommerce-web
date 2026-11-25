"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Bot,
  Check,
  ChevronDown,
  LoaderCircle,
  Phone,
  UserRound,
  X,
} from "lucide-react";
import { useProducts } from "@/components/ProductsProvider";
import { showsCondition, type StockCondition } from "@/data/conditions";
import { isDemoService, productLabel, SERVICE_CATEGORY } from "@/data/products";
import ConditionLine from "@/components/ui/ConditionLine";
import {
  CATEGORY_INTEREST,
  EMPTY_QUOTE,
  PUDU_VENUES,
  QUOTE_INTERESTS,
  QUOTE_NOTE_MAX,
  validateQuote,
  type QuoteField,
  type QuoteRequest,
} from "@/lib/quoteRequest";
import { submitQuote } from "@/lib/submitQuote";
import { buttonClass } from "@/components/ui/Button";
import { fieldAreaClass, fieldControlClass, fieldErrorClass } from "@/components/ui/Field";

/** What the form asks for, in order — shown as a track while the card is closed. */
const STEPS = [
  { key: "name", Icon: UserRound },
  { key: "contact", Icon: Phone },
  { key: "robot", Icon: Bot },
] as const;

/** The storefront's one field look (components/ui/Field.tsx): 48px tall and
 *  16px text, so iOS doesn't zoom the page when a field takes focus. */
const inputClass = (hasError: boolean) =>
  hasError ? `${fieldControlClass} border-red-600` : fieldControlClass;

/** A choice tile for a single-answer question (which robot, new or pre-owned):
 *  bordered, with a radio mark, the same as the homepage quote form. */
const choiceClass = (selected: boolean, hasError: boolean) =>
  `flex min-h-12 w-full cursor-pointer items-center gap-2.5 rounded-control border px-3 py-2.5 text-left text-small font-medium transition-colors focus-visible:outline-none! focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 ${
    selected
      ? "border-accent-600 bg-accent-50 text-accent-600"
      : hasError
        ? "border-red-600 text-content hover:border-accent-600/50"
        : "border-forest-100 text-content hover:border-accent-600/50"
  }`;

function ChoiceMark({ selected }: { selected: boolean }) {
  return (
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
        selected ? "border-accent bg-accent text-on-accent" : "border-forest-300"
      }`}
      aria-hidden="true"
    >
      {selected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
    </span>
  );
}

const labelClass = "text-small font-medium text-content";
const errorClass = fieldErrorClass.replace("mt-1.5 ", "");

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
      <label htmlFor={id} className={labelClass}>
        {label}
        {!optional && (
          <span className="ml-0.5 text-accent-600" aria-hidden="true">
            *
          </span>
        )}
        {optional && (
          <span className="ml-1.5 font-normal text-ink-muted">({optional})</span>
        )}
      </label>
      {children}
      {error && (
        <p role="alert" className={errorClass}>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * The site's one quote form, in two layouts:
 *
 * - "card": the compact card pinned to the left of the hero. Only the name
 *   field shows until the visitor focuses it — then the card grows to company,
 *   phone, email, and which robot they want.
 * - "panel": always open, inside the quote panel (QuoteDrawer) that every
 *   "interested" button opens. That button's product comes in as `productId`
 *   (and `forId`, the robot a demo or installation is for) and answers "which
 *   robot", so the robot choice is skipped. A homepage banner passes
 *   `interest` instead, which only preselects that choice.
 *
 * Lawn mowing asks for the lawn area; Pudu delivery asks for the venue it
 * will serve.
 */
export default function QuoteForm({
  variant = "card",
  productId,
  forId,
  interest,
  onExpandedChange,
  initial,
}: {
  variant?: "card" | "panel";
  productId?: string;
  forId?: string;
  /** Preselected robot family (a homepage banner's button). */
  interest?: QuoteRequest["interest"];
  /** Card only: told when it opens or closes, so the page can make room. */
  onExpandedChange?: (expanded: boolean) => void;
  /** What the visitor typed before the form opened (the hero's quote strip). */
  initial?: { fullName?: string; phone?: string };
}) {
  const t = useTranslations("heroQuote");
  const tc = useTranslations("checkout");
  const tq = useTranslations("quotation");
  const tcond = useTranslations("condition");
  const tcart = useTranslations("cart");
  const locale = useLocale();
  const formId = useId();
  const rootRef = useRef<HTMLFormElement>(null);
  const { getProduct } = useProducts();
  const product = productId ? getProduct(productId) : undefined;
  const forProduct = forId ? getProduct(forId) : undefined;
  // A robot (not a service) is sold new, pre-owned or both: the form shows how,
  // and asks which when it's both.
  const sold = product && product.category !== SERVICE_CATEGORY ? product : undefined;
  // What the button asked about — shown at the top, and the answer to "which robot".
  const selection = product ? productLabel(product) : undefined;
  const panel = variant === "panel";
  // Opened from Request a Demo: a booking, so it says so instead of "quote".
  const demo = isDemoService(product);
  const title = demo ? t("demoTitle") : t("eyebrow");

  const [expanded, setExpandedState] = useState(false);
  const setExpanded = useCallback(
    (next: boolean) => {
      setExpandedState(next);
      onExpandedChange?.(next);
    },
    [onExpandedChange]
  );
  const open = panel || expanded;
  const [form, setForm] = useState<QuoteRequest>(() => ({
    ...EMPTY_QUOTE,
    ...(initial?.fullName ? { fullName: initial.fullName } : {}),
    ...(initial?.phone ? { phone: initial.phone } : {}),
    productId: product?.id ?? "",
    forId: forProduct?.id ?? "",
    condition: sold?.conditions.length === 1 ? sold.conditions[0] : "",
    // The robot's category still sets its follow-up (a mower's lawn area,
    // a Pudu's venue), so it is kept even though the choice isn't shown.
    interest:
      (product && CATEGORY_INTEREST[product.category]) ||
      interest ||
      "",
  }));
  const [errors, setErrors] = useState<Partial<Record<QuoteField, string>>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const fieldId = (name: QuoteField) => `${formId}-${name}`;

  useEffect(() => {
    if (!expanded || panel) return;
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
  }, [expanded, panel, setExpanded]);

  // Stacked under the hero (phones, tablets), the card opens mostly below the
  // fold, so opening it scrolls it into view. Nothing moves when it's already
  // fully visible, as on desktop.
  //
  // Tapping a text field on a touch screen also brings up the keyboard, and
  // the browser scrolls for that on its own. Scrolling after it (measured
  // against the keyboard-shrunk visual viewport) pushed the form out of
  // sight behind the keyboard on phones. So in that case the page jumps once,
  // straight away, before the keyboard is up: the card's top just under the
  // sticky header, which keeps the field being typed in near the top, where
  // the keyboard never needs to scroll for it. Otherwise (mouse, keyboard
  // Tab) it waits for the card to finish growing and glides it to the
  // centre, or to the top when it's taller than the screen.
  //
  // Only the window scrolls — not scrollIntoView, which also scrolls clipped
  // ancestors: it shifted the hero's own content up, out of reach.
  useEffect(() => {
    if (!expanded || panel) return;
    const active = document.activeElement;
    const keyboardComing =
      window.matchMedia("(pointer: coarse)").matches &&
      ((active instanceof HTMLInputElement &&
        !["radio", "checkbox", "button", "submit"].includes(active.type)) ||
        active instanceof HTMLTextAreaElement);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const bringIntoView = () => {
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // the header is sticky, so once the page moves it sits at the very top
      const visibleTop = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      const visibleHeight = window.innerHeight - visibleTop;
      let landAt = visibleTop + 12;
      if (!keyboardComing) {
        if (rect.top >= visibleTop && rect.bottom <= window.innerHeight) return;
        if (rect.height <= visibleHeight) landAt = visibleTop + (visibleHeight - rect.height) / 2;
      }
      if (Math.abs(rect.top - landAt) < 4) return;
      window.scrollBy({
        top: rect.top - landAt,
        behavior: keyboardComing || reduceMotion ? "instant" : "smooth",
      });
    };

    if (keyboardComing) {
      const frame = requestAnimationFrame(bringIntoView);
      return () => cancelAnimationFrame(frame);
    }
    const timer = setTimeout(bringIntoView, 350); // after the 300ms widen and the notes folding away
    return () => clearTimeout(timer);
  }, [expanded, panel]);

  const setField =
    (name: QuoteField) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setForm((current) => ({ ...current, [name]: value }));
      setErrors((current) => {
        if (!current[name]) return current;
        const next = { ...current };
        delete next[name];
        return next;
      });
    };

  const chooseInterest = (interest: QuoteRequest["interest"]) => {
    setForm((current) => ({ ...current, interest }));
    setErrors((current) => {
      if (!current.interest) return current;
      const next = { ...current };
      delete next.interest;
      return next;
    });
  };

  const needsCondition = !!sold && sold.conditions.length > 1;

  const chooseCondition = (condition: StockCondition) => {
    setForm((current) => ({ ...current, condition }));
    setErrors((current) => {
      if (!current.condition) return current;
      const next = { ...current };
      delete next.condition;
      return next;
    });
  };

  const err = (name: QuoteField) => {
    const key = errors[name];
    if (!key) return undefined;
    if (key === "area" || key === "count") return t(`errors.${key}`);
    return tc(`errors.${key}`);
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors = validateQuote(form, { productChosen: !!selection, needsCondition });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setExpanded(true);
      const first = Object.keys(nextErrors)[0] as QuoteField;
      const target = document.getElementById(fieldId(first));
      if (first === "interest" || first === "condition") {
        target?.parentElement?.querySelector<HTMLElement>("[role='radio']")?.focus();
      } else {
        target?.focus();
      }
      return;
    }

    setBusy(true);
    setSendError(null);
    try {
      const outcome = await submitQuote(form, locale);
      if (outcome !== "sent") {
        setSendError(t(outcome));
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
      aria-expanded={panel ? undefined : expanded}
      aria-label={title}
      className={
        panel
          ? "text-left"
          : `group relative z-20 max-w-[calc(100vw-2rem)] shrink-0 text-left transition-[width] duration-300 ease-out motion-reduce:transition-none ${
              expanded ? "w-[min(26.5rem,calc(100vw-2rem))]" : "w-[20rem]"
            }`
      }
    >
      <div
        className={
          panel
            ? ""
            : `overflow-hidden rounded-card border border-black/8 bg-surface/95 backdrop-blur-md lg:border-white/10 lg:bg-[#141821]/75 lg:backdrop-blur-xl ${
                expanded
                  ? "max-h-[calc(100svh-6.5rem)] overflow-y-auto shadow-float"
                  : "shadow-float"
              }`
        }
      >
        {!panel && <div className="h-0.5 bg-accent" aria-hidden="true" />}
        <div className={panel ? "" : "px-4 py-3.5 sm:px-5"}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 pt-0.5">
              {/* the panel's own header already says "Get a quote" */}
              {!panel && <p className="font-display text-heading text-content">{title}</p>}
              {open && !sent && (
                <p className={`text-caption leading-snug text-ink-muted ${panel ? "" : "mt-1"}`}>
                  {demo ? t("demoSub") : t("sub")}
                </p>
              )}
            </div>
            {expanded && !panel && (
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-control text-ink-muted transition-colors hover:bg-cloud hover:text-content active:bg-forest-100 focus-visible:outline-none! focus-visible:ring-2 focus-visible:ring-accent/40"
                aria-label={t("close")}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {sent ? (
            <p className="mt-4 text-small leading-relaxed text-content" role="status">
              <span className="block font-display text-lead font-bold">{t("successTitle")}</span>
              <span className="mt-1.5 block text-ink-muted">
                {t(demo ? "demoSuccessBody" : "successBody", { name: form.fullName.trim(), phone: form.phone.trim() })}
              </span>
            </p>
          ) : (
            <>
              {selection && (
                <div className="mt-4 flex items-center gap-3 rounded-control border border-accent/40 bg-accent/10 px-3.5 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-accent text-on-accent">
                    <Bot className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-caption font-medium text-ink-muted">{t("selectionLabel")}</p>
                    <p className="font-display text-body leading-snug font-bold text-content">
                      {selection}
                    </p>
                    {sold && sold.conditions.length === 1 && showsCondition(sold.conditions) && (
                      <ConditionLine conditions={sold.conditions} className="mt-0.5" />
                    )}
                    {forProduct && (
                      <p className="text-caption font-medium text-accent-600">
                        {tcart("forRobot", { name: forProduct.name })}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {sold && sold.conditions.length > 1 && (
                <div className="mt-4 flex flex-col gap-1.5">
                  <p id={fieldId("condition")} className={labelClass}>
                    {tcond("ask")}
                    <span className="ml-0.5 text-accent-600" aria-hidden="true">
                      *
                    </span>
                  </p>
                  <div
                    role="radiogroup"
                    aria-labelledby={fieldId("condition")}
                    className="grid grid-cols-2 gap-2"
                  >
                    {sold.conditions.map((condition) => {
                      const selected = form.condition === condition;
                      return (
                        <button
                          key={condition}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => chooseCondition(condition)}
                          className={choiceClass(selected, !!errors.condition)}
                        >
                          <span className="flex-1">
                            {condition === "new" ? tcond("new") : tcond("preOwned")}
                          </span>
                          <ChoiceMark selected={selected} />
                        </button>
                      );
                    })}
                  </div>
                  {err("condition") && (
                    <p role="alert" className={errorClass}>
                      {err("condition")}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4">
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
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden" inert={open ? undefined : true}>
                  {/* one column: on a phone, phone and email side by side were
                      ~150px each, too narrow to read back what was typed */}
                  <div className="mt-4 grid gap-4">
                    <div>
                      <Field
                        id={fieldId("company")}
                        label={t("companyLabel")}
                        optional={tc("optional")}
                      >
                        <input
                          id={fieldId("company")}
                          name="company"
                          autoComplete="organization"
                          value={form.company}
                          onChange={setField("company")}
                          className={inputClass(false)}
                        />
                      </Field>
                    </div>
                    <Field id={fieldId("phone")} label={tc("phone")} error={err("phone")}>
                      <input
                        id={fieldId("phone")}
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="+66 123456789"
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
                    {/* a product from the button already answers "which robot" */}
                    {!selection && (
                      <div>
                        <div className="flex flex-col gap-1.5">
                          <p id={fieldId("interest")} className={labelClass}>
                            {t("interestLabel")}
                            <span className="ml-0.5 text-accent-600" aria-hidden="true">
                              *
                            </span>
                          </p>
                          <div
                            role="radiogroup"
                            aria-labelledby={fieldId("interest")}
                            // one column on phones: two ~155px tiles split
                            // Thai words ("ทำความ / สะอาด")
                            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                          >
                            {QUOTE_INTERESTS.map((interest) => {
                              const selected = form.interest === interest;
                              return (
                                <button
                                  key={interest}
                                  type="button"
                                  role="radio"
                                  aria-checked={selected}
                                  onClick={() => chooseInterest(interest)}
                                  className={choiceClass(selected, !!errors.interest)}
                                >
                                  <span className="flex-1">{t(`interests.${interest}`)}</span>
                                  <ChoiceMark selected={selected} />
                                </button>
                              );
                            })}
                          </div>
                          {err("interest") && (
                            <p role="alert" className={errorClass}>
                              {err("interest")}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {form.interest === "lawn-mowing" && (
                      <div>
                        <Field id={fieldId("areaM2")} label={t("areaLabel")} error={err("areaM2")}>
                          <div className="relative">
                            <input
                              id={fieldId("areaM2")}
                              name="areaM2"
                              inputMode="decimal"
                              placeholder={t("areaPlaceholder")}
                              value={form.areaM2}
                              onChange={setField("areaM2")}
                              className={`${inputClass(!!errors.areaM2)} pr-12`}
                            />
                            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-small font-medium text-ink-muted">
                              m²
                            </span>
                          </div>
                        </Field>
                      </div>
                    )}
                    {form.interest === "pudu-delivery" && (
                      <>
                        <div>
                          <Field id={fieldId("venue")} label={t("venueLabel")} error={err("venue")}>
                            <div className="relative">
                              <select
                                id={fieldId("venue")}
                                name="venue"
                                value={form.venue}
                                onChange={setField("venue")}
                                className={`${inputClass(!!errors.venue)} appearance-none pr-9`}
                              >
                                <option value="">{t("venuePlaceholder")}</option>
                                {PUDU_VENUES.map((venue) => (
                                  <option key={venue} value={venue}>
                                    {t(`venues.${venue}`)}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown
                                className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-ink-muted"
                                aria-hidden="true"
                              />
                            </div>
                          </Field>
                        </div>
                        {/* two short numbers: these still fit side by side */}
                        <div className="grid grid-cols-2 gap-3">
                        <Field
                          id={fieldId("servingCount")}
                          label={t("servingLabel")}
                          error={err("servingCount")}
                        >
                          <input
                            id={fieldId("servingCount")}
                            name="servingCount"
                            inputMode="numeric"
                            placeholder={t("servingPlaceholder")}
                            value={form.servingCount}
                            onChange={setField("servingCount")}
                            className={inputClass(!!errors.servingCount)}
                          />
                        </Field>
                        <Field id={fieldId("floors")} label={t("floorsLabel")} error={err("floors")}>
                          <input
                            id={fieldId("floors")}
                            name="floors"
                            inputMode="numeric"
                            placeholder={t("floorsPlaceholder")}
                            value={form.floors}
                            onChange={setField("floors")}
                            className={inputClass(!!errors.floors)}
                          />
                        </Field>
                        </div>
                      </>
                    )}
                    {/* last, and optional: whatever else is on their mind */}
                    <div>
                      <Field id={fieldId("note")} label={t("noteLabel")} optional={tc("optional")}>
                        <textarea
                          id={fieldId("note")}
                          name="note"
                          rows={3}
                          maxLength={QUOTE_NOTE_MAX}
                          placeholder={t("notePlaceholder")}
                          value={form.note}
                          onChange={setField("note")}
                          className={`${fieldAreaClass} resize-y`}
                        />
                      </Field>
                    </div>
                  </div>

                  {sendError && (
                    <p role="alert" className="mt-3 text-small font-medium text-red-600">
                      {sendError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className={buttonClass({ size: "lg", fullWidth: true, className: "mt-5 gap-2" })}
                  >
                    {busy ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                        {t("sending")}
                      </>
                    ) : (
                      <>
                        {demo ? t("demoSubmit") : tq("submitCta")}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {!open && (
                <ol className="mt-4 flex items-start">
                  {STEPS.map(({ key, Icon }, index) => {
                    // Name is the field on show, so it's the step in progress —
                    // ticked off once something is typed; the rest are ahead.
                    const done = index === 0 && form.fullName.trim() !== "";
                    const current = index === 0 && !done;
                    return (
                      <li
                        key={key}
                        className="relative flex flex-1 flex-col items-center gap-1.5 text-center"
                      >
                        {index > 0 && (
                          <span
                            aria-hidden="true"
                            // from halo edge to halo edge (icon radius 14px
                            // + 4px ring) — drawn under the icons, the line
                            // showed through the one to its left
                            className={`absolute top-3.5 right-[calc(50%_+_1.125rem)] left-[calc(-50%_+_1.125rem)] h-px transition-colors duration-200 ${
                              index === 1 && form.fullName.trim() ? "bg-accent" : "bg-forest-100"
                            }`}
                          />
                        )}
                        <span
                          className={`relative flex h-7 w-7 items-center justify-center rounded-full border transition-colors duration-200 ${
                            done
                              ? "border-accent bg-accent text-on-accent"
                              : current
                                ? "border-accent bg-surface text-accent-600 ring-4 ring-accent/20"
                                : "border-forest-100 bg-surface text-ink-muted"
                          }`}
                        >
                          {done ? (
                            <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                          ) : (
                            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                        </span>
                        <span
                          className={`px-0.5 text-caption leading-tight font-semibold ${
                            index === 0 ? "text-content" : "text-ink-muted"
                          }`}
                        >
                          {t(`steps.${key}`)}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}

              {/* what asking costs them — under the steps while closed, under
                  the submit button once open */}
              <p className="mt-3 text-center text-caption leading-snug font-medium text-ink-muted">
                {/* a demo has a fee (credited toward the purchase), so not "free" */}
                {demo ? t("demoReassure") : t("reassure")}
              </p>
            </>
          )}
        </div>
      </div>
    </form>
  );
}

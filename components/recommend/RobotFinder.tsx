"use client";

import { useId, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChefHat,
  CircleHelp,
  ConciergeBell,
  RotateCcw,
  Sparkles,
  Trees,
  X,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useProducts } from "@/components/ProductsProvider";
import { useQuote } from "@/components/quote/QuoteProvider";
import ConditionLine from "@/components/ui/ConditionLine";
import ProductVisual from "@/components/ui/ProductVisual";
import { DEFAULT_BRAND } from "@/data/products";
import { EMAIL_RE, PHONE_RE } from "@/lib/quoteRequest";
import {
  JOBS,
  OPERATION_PREFS,
  SLOPE_BANDS,
  VENUES,
  recommend,
  type Answers,
  type Job,
  type Match,
  type OperationPref,
  type Reason,
  type SlopeBand,
  type Venue,
} from "@/lib/recommend";

const JOB_ICONS: Record<Job, LucideIcon> = {
  lawn: Trees,
  floor: Sparkles,
  cooking: ChefHat,
  delivery: ConciergeBell,
};

type Step = "job" | "details" | "results";

const inputClass = (hasError = false) =>
  `h-11 w-full rounded-lg border bg-surface px-3 text-[15px] text-content transition-colors placeholder:text-forest-300 focus-visible:outline-none! focus-visible:ring-2 ${
    hasError
      ? "border-red-400 focus-visible:ring-red-200"
      : "border-forest-100 focus-visible:border-accent-600 focus-visible:ring-accent/25"
  }`;

/** A big choice button; `selected` shows the pick when coming back a step. */
function Choice({
  selected,
  onClick,
  title,
  hint,
  Icon,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  hint?: string;
  Icon?: LucideIcon;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors focus-visible:outline-none! focus-visible:ring-2 focus-visible:ring-accent/40 ${
        selected
          ? "border-accent bg-accent/[0.07] shadow-[0_0_0_1px_var(--color-accent)]"
          : "border-forest-100 bg-surface hover:border-forest-300"
      }`}
    >
      {Icon && (
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            selected ? "bg-accent text-white" : "bg-cloud text-content"
          }`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      )}
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold text-content">{title}</span>
        {hint && <span className="mt-0.5 block text-[13px] leading-snug text-ink-muted">{hint}</span>}
      </span>
    </button>
  );
}

const REASON_ICON = { good: Check, check: CircleHelp, miss: X } as const;
const REASON_TONE = {
  good: "text-accent-600",
  check: "text-amber-600",
  miss: "text-red-600",
} as const;

function ResultCard({ match, rank }: { match: Match; rank: number }) {
  const t = useTranslations("recommend");
  const tn = useTranslations("nav");
  const { openQuote } = useQuote();
  const { product } = match;
  const reasonText = (r: Reason) => t(`reasons.${r.key}`, r.values ?? {});

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-forest-100 bg-surface sm:flex-row">
      <div className="relative flex h-48 shrink-0 items-center justify-center bg-gradient-to-b from-cloud to-forest-100/40 p-5 sm:h-auto sm:w-56">
        <span className="absolute top-3 left-3 font-mono text-[11px] font-semibold tracking-[0.18em] text-ink-muted">
          {String(rank).padStart(2, "0")}
        </span>
        <ProductVisual product={product} className="h-full max-h-40 w-full" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <span className="font-mono text-[10px] font-semibold tracking-[0.18em] text-accent-600 uppercase">
          {product.brand ?? DEFAULT_BRAND}
        </span>
        <h3 className="mt-1 font-display text-xl leading-snug font-bold text-content">{product.name}</h3>
        <ConditionLine conditions={product.conditions} className="mt-2" />
        <ul className="mt-3.5 space-y-1.5">
          {match.reasons.map((r) => {
            const Icon = REASON_ICON[r.tone];
            return (
              <li key={r.key} className="flex items-start gap-2 text-[13.5px] leading-snug text-content">
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${REASON_TONE[r.tone]}`} aria-hidden="true" />
                <span>{reasonText(r)}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
          <button
            type="button"
            onClick={() => openQuote({ productId: product.id })}
            className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full bg-accent-gradient px-6 text-[14px] font-bold"
          >
            {tn("getQuote")}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <Link
            href={`/products/${product.id}`}
            className="inline-flex min-h-11 items-center rounded-full border border-forest-100 px-5 text-[14px] font-semibold text-content transition-colors hover:border-accent"
          >
            {t("viewRobot")}
          </Link>
        </div>
      </div>
    </article>
  );
}

type ContactState = "idle" | "sending" | "sent" | "error";

function ContactForm({ answers, requestId }: { answers: Answers; requestId: string | null }) {
  const t = useTranslations("recommend.contact");
  const locale = useLocale();
  const uid = useId();
  const [fields, setFields] = useState({ name: "", phone: "", email: "", note: "" });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<ContactState>("idle");
  // optional: only an offer until the customer asks to be contacted
  const [open, setOpen] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // same rules as the server, checked here first so a typo isn't a round trip
    const local: Record<string, string> = {};
    if (!fields.name.trim()) local.name = "required";
    if (!fields.phone.trim()) local.phone = "required";
    else if (!PHONE_RE.test(fields.phone.trim())) local.phone = "phone";
    if (fields.email.trim() && !EMAIL_RE.test(fields.email.trim())) local.email = "email";
    if (!consent) local.consent = "required";
    setErrors(local);
    if (Object.keys(local).length > 0) return;
    setState("sending");
    try {
      const res = await fetch("/api/recommendations/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: requestId, answers, contact: fields, consent, locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) return setState("sent");
      if (res.status === 400 && data.errors) {
        setErrors(data.errors);
        return setState("idle");
      }
      setState("error");
    } catch {
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <div role="status" className="rounded-2xl border border-accent/40 bg-accent/[0.07] p-6">
        <p className="font-display text-lg font-bold text-content">{t("sentTitle")}</p>
        <p className="mt-1 text-[14px] text-ink-muted">{t("sentBody")}</p>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-forest-100 bg-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="font-display text-xl font-bold text-content">{t("title")}</h2>
          <p className="mt-1 text-[14px] text-ink-muted">{t("offer")}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 self-start rounded-full border border-forest-100 px-5 text-[14px] font-semibold text-content transition-colors hover:border-accent sm:self-auto"
        >
          {t("open")}
        </button>
      </div>
    );
  }

  const field = (name: keyof typeof fields, type = "text", optional = false) => {
    const id = `${uid}-${name}`;
    const error = errors[name];
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-[12.5px] font-medium text-ink-muted">
          {t(`fields.${name}`)}
          {optional ? (
            <span className="ml-1.5 font-normal">({t("optional")})</span>
          ) : (
            <span className="ml-0.5 text-accent-600" aria-hidden="true">*</span>
          )}
        </label>
        <input
          id={id}
          type={type}
          value={fields[name]}
          onChange={(e) => setFields((f) => ({ ...f, [name]: e.target.value }))}
          autoComplete={name === "name" ? "name" : name === "phone" ? "tel" : name === "email" ? "email" : "off"}
          aria-invalid={!!error}
          className={inputClass(!!error)}
        />
        {error && (
          <p role="alert" className="text-[12px] font-medium text-red-600">
            {t(`errors.${error}`)}
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={submit} noValidate className="rounded-2xl border border-forest-100 bg-surface p-5 sm:p-6">
      <h2 className="font-display text-xl font-bold text-content">{t("title")}</h2>
      <p className="mt-1 text-[14px] text-ink-muted">{t("sub")}</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {field("name")}
        {field("phone", "tel")}
        {field("email", "email", true)}
        {field("note", "text", true)}
      </div>
      <label className="mt-5 flex items-start gap-2.5 text-[13px] leading-snug text-content">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          aria-invalid={!!errors.consent}
          className="mt-0.5 h-4.5 w-4.5 shrink-0 rounded border-forest-100 accent-accent"
        />
        <span>{t("consent")}</span>
      </label>
      {errors.consent && (
        <p role="alert" className="mt-1.5 text-[12px] font-medium text-red-600">
          {t("errors.consent")}
        </p>
      )}
      {state === "error" && (
        <p role="alert" className="mt-3 text-[13px] font-medium text-red-600">
          {t("errors.send")}
        </p>
      )}
      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-5 inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full bg-accent-gradient px-6 text-[14px] font-bold disabled:opacity-60"
      >
        {state === "sending" ? t("sending") : t("submit")}
      </button>
    </form>
  );
}

/**
 * The robot recommender: a few questions, then the best-fit robots from the
 * catalogue with the reasons (lib/recommend.ts). Answers are saved as soon as
 * the results show; contact details only if the customer sends them.
 */
export default function RobotFinder() {
  const t = useTranslations("recommend");
  const locale = useLocale();
  const { products } = useProducts();
  const uid = useId();

  const [step, setStep] = useState<Step>("job");
  const [job, setJob] = useState<Job | null>(null);
  const [area, setArea] = useState("");
  const [slope, setSlope] = useState<SlopeBand | null>(null);
  const [operation, setOperation] = useState<OperationPref | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const buildAnswers = (j: Job): Answers => {
    const areaM2 = Number(area.replace(/[^\d.]/g, ""));
    return {
      job: j,
      ...(areaM2 > 0 && (j === "lawn" || j === "floor") ? { areaM2: Math.round(areaM2) } : {}),
      ...(j === "lawn" && slope ? { slope } : {}),
      ...(j === "floor" && operation ? { operation } : {}),
      ...(j === "delivery" && venue ? { venue } : {}),
    };
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- buildAnswers reads exactly these
  const answers = useMemo(() => (job ? buildAnswers(job) : null), [job, area, slope, operation, venue]);

  const matches = useMemo(
    () => (answers && step === "results" ? recommend(products, answers) : []),
    [answers, products, step]
  );

  // cooking has no follow-up question: picking it goes straight to results
  const steps: Step[] = job === "cooking" ? ["job"] : ["job", "details"];
  const stepNumber = steps.indexOf(step) + 1;

  /** `j` when the job was only just picked (state not updated yet). */
  const showResults = (j: Job | null = job) => {
    if (!j) return;
    const answers = buildAnswers(j);
    setStep("results");
    setRequestId(null);
    // save the questionnaire; the results don't wait for it
    fetch("/api/recommendations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ answers, locale }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data?.id && setRequestId(data.id))
      .catch(() => {});
  };

  const restart = () => {
    setStep("job");
    setJob(null);
    setArea("");
    setSlope(null);
    setOperation(null);
    setVenue(null);
    setRequestId(null);
  };

  const back = () => setStep(steps[Math.max(0, steps.indexOf(step) - 1)]);

  if (step === "results" && answers) {
    const anyFit = matches.some((m) => m.fits);
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-content sm:text-3xl">
              {matches.length === 0 ? t("results.noneTitle") : anyFit ? t("results.title") : t("results.closeTitle")}
            </h2>
            <p className="mt-1 max-w-2xl text-[14px] text-ink-muted">
              {matches.length === 0
                ? t("results.noneSub")
                : anyFit
                  ? t(`results.sub.${answers.job}`)
                  : t("results.closeSub")}
            </p>
          </div>
          <button
            type="button"
            onClick={restart}
            className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border border-forest-100 bg-surface px-4 text-[13.5px] font-semibold text-content transition-colors hover:border-accent"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t("startAgain")}
          </button>
        </div>
        {matches.length > 0 && (
          <div className="space-y-4">
            {matches.map((m, i) => (
              <ResultCard key={m.product.id} match={m} rank={i + 1} />
            ))}
          </div>
        )}
        <p className="text-[12px] text-ink-muted">{t("results.footnote")}</p>
        <ContactForm answers={answers} requestId={requestId} />
      </div>
    );
  }

  const canContinue =
    step === "job" ? !!job : step === "details" ? job === "lawn" || job === "floor" || !!venue : true;

  return (
    <div className="rounded-2xl border border-forest-100 bg-surface p-5 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.35)] sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-ink-muted uppercase">
          {t("stepOf", { step: Math.max(1, stepNumber), total: steps.length })}
        </p>
        <div className="flex gap-1.5" aria-hidden="true">
          {steps.map((s, i) => (
            <span
              key={s}
              className={`h-1 w-8 rounded-full ${i < stepNumber ? "bg-accent" : "bg-forest-100"}`}
            />
          ))}
        </div>
      </div>

      {step === "job" && (
        <fieldset className="mt-5">
          <legend className="font-display text-2xl font-bold text-content">{t("job.question")}</legend>
          <div role="radiogroup" className="mt-4 grid gap-3 sm:grid-cols-2">
            {JOBS.map((j) => (
              <Choice
                key={j}
                selected={job === j}
                onClick={() => {
                  setJob(j);
                  if (j === "cooking") showResults(j);
                  else setStep("details");
                }}
                title={t(`job.${j}.title`)}
                hint={t(`job.${j}.hint`)}
                Icon={JOB_ICONS[j]}
              />
            ))}
          </div>
        </fieldset>
      )}

      {step === "details" && (job === "lawn" || job === "floor") && (
        <div className="mt-5 space-y-6">
          <div>
            <label htmlFor={`${uid}-area`} className="font-display text-2xl font-bold text-content">
              {t(`${job}.areaQuestion`)}
            </label>
            <p className="mt-1 text-[13.5px] text-ink-muted">{t(`${job}.areaHint`)}</p>
            <div className="mt-3 flex max-w-xs items-center gap-2">
              <input
                id={`${uid}-area`}
                inputMode="numeric"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder={job === "lawn" ? "1,500" : "800"}
                className={inputClass()}
              />
              <span className="text-[14px] font-semibold text-content">{t("sqm")}</span>
            </div>
          </div>
          {job === "lawn" ? (
            <fieldset>
              <legend className="font-display text-lg font-bold text-content">{t("lawn.slopeQuestion")}</legend>
              <div role="radiogroup" className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {SLOPE_BANDS.map((s) => (
                  <Choice
                    key={s}
                    selected={slope === s}
                    onClick={() => setSlope(s)}
                    title={t(`lawn.slope.${s}.title`)}
                    hint={t(`lawn.slope.${s}.hint`)}
                  />
                ))}
              </div>
            </fieldset>
          ) : (
            <fieldset>
              <legend className="font-display text-lg font-bold text-content">{t("floor.operationQuestion")}</legend>
              <div role="radiogroup" className="mt-3 grid gap-2.5 sm:grid-cols-3">
                {OPERATION_PREFS.map((o) => (
                  <Choice
                    key={o}
                    selected={operation === o}
                    onClick={() => setOperation(o)}
                    title={t(`floor.operation.${o}.title`)}
                    hint={t(`floor.operation.${o}.hint`)}
                  />
                ))}
              </div>
            </fieldset>
          )}
        </div>
      )}

      {step === "details" && job === "delivery" && (
        <fieldset className="mt-5">
          <legend className="font-display text-2xl font-bold text-content">{t("delivery.venueQuestion")}</legend>
          <div role="radiogroup" className="mt-4 grid gap-2.5 sm:grid-cols-3">
            {VENUES.map((v) => (
              <Choice key={v} selected={venue === v} onClick={() => setVenue(v)} title={t(`delivery.venue.${v}`)} />
            ))}
          </div>
        </fieldset>
      )}


      <div className="mt-8 flex items-center justify-between gap-3">
        {step !== "job" ? (
          <button
            type="button"
            onClick={back}
            className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[14px] font-semibold text-ink-muted transition-colors hover:text-content"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t("back")}
          </button>
        ) : (
          <span />
        )}
        {step !== "job" && (
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => showResults()}
            className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full bg-accent-gradient px-6 text-[14px] font-bold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("seeResults")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

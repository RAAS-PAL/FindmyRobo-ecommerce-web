"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Clock3, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { QuoteRequest } from "@/lib/quoteRequest";
import HomeQuoteForm from "./HomeQuoteForm";
import LineChatButton from "./LineChatButton";

const PROMISES = ["warranty", "install", "aftersales"] as const;
type QuoteTarget = { interest?: QuoteRequest["interest"]; productId?: string };

/** A single home-page consultation section, with an inline two-step enquiry. */
export default function QuoteStrip({ interest, productId }: QuoteTarget) {
  const t = useTranslations("heroQuote");
  const ts = useTranslations("showcase");
  const reduceMotion = useReducedMotion();
  const uid = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  // Capture the slide on first open. Switching the hero later must not change
  // the enquiry, and folding the panel must never discard the visitor's work.
  const [target, setTarget] = useState<QuoteTarget | null>(null);

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
  };

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const rect = panel.getBoundingClientRect();
      const top = Math.max(0, document.querySelector("header")?.getBoundingClientRect().bottom ?? 0) + 20;
      // Only move the page if the form starts out of view or extends below it.
      // Align its heading below the sticky navigation, never focus a mobile input.
      if (rect.top < top || rect.bottom > window.innerHeight - 20) {
        window.scrollBy({ top: rect.top - top, behavior: reduceMotion ? "instant" : "smooth" });
      }
    }, reduceMotion ? 0 : 380);
    return () => clearTimeout(timer);
  }, [open, reduceMotion]);

  return (
    <section aria-labelledby={uid + "-title"} data-hero-quote
      className="grid rounded-2xl border border-forest-100 bg-surface shadow-[0_16px_48px_-32px_rgb(15_23_42/0.25)] lg:grid-cols-[0.9fr_1.1fr]">
      <div className="flex flex-col rounded-t-2xl bg-cloud/55 p-6 sm:p-8 lg:rounded-l-2xl lg:rounded-tr-none lg:p-10">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-accent-600 uppercase [&:lang(th)]:tracking-normal">
          {t("consultation.eyebrow")}
        </p>
        <h2 id={uid + "-title"} className="mt-3 max-w-sm font-display text-[28px] leading-[1.15] font-bold tracking-tight text-content sm:text-[32px]">
          {t("consultation.title")}
        </h2>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">{t("consultation.description")}</p>

        <ul aria-label={t("promisesLabel")} className="mt-6 flex flex-wrap gap-x-5 gap-y-3 lg:flex-col">
          {PROMISES.map((key) => (
            <li key={key} className="flex items-center gap-2.5 text-[13px] font-medium text-content">
              <Check className="h-4 w-4 shrink-0 text-accent-600" strokeWidth={2.5} aria-hidden="true" />
              {t("promises." + key)}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-7">
          <div className="border-t border-forest-100 pt-5">
            <div className="max-w-xs"><LineChatButton /></div>
            <Link href="/recommend" className="mt-4 inline-flex min-h-8 flex-wrap items-center gap-x-1.5 text-[13px] leading-relaxed text-ink-muted">
              {ts("finderPrompt")}
              <span className="inline-flex items-center gap-1.5 font-semibold text-accent-600 underline-offset-4 hover:underline">
                {ts("finderLink")}<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div ref={panelRef} className="relative flex min-w-0 flex-col justify-center border-t border-forest-100 p-6 sm:p-8 lg:border-t-0 lg:border-l lg:p-10"
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            event.stopPropagation();
            close();
          }
        }}>
        <div aria-hidden={open} inert={open ? true : undefined}
          className={"grid transition-[grid-template-rows,opacity] duration-350 ease-in-out motion-reduce:transition-none " + (open ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100")}>
          <div className="min-h-0 overflow-hidden">
            <h3 className="font-display text-2xl leading-tight font-bold tracking-tight text-content">{t("consultation.previewTitle")}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{t("consultation.previewBody")}</p>
            <ol className="my-7 space-y-5">
              {(["project", "contact"] as const).map((name, index) => (
                <li key={name} className="flex items-start gap-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-forest-100 font-mono text-xs text-accent-600" aria-hidden="true">0{index + 1}</span>
                  <div>
                    <p className="text-[15px] font-semibold text-content">{t("consultation.steps." + name)}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-ink-muted">{t("consultation.previewSteps." + name)}</p>
                  </div>
                </li>
              ))}
            </ol>
            <button ref={triggerRef} type="button" aria-expanded={open} aria-controls={uid + "-form"}
              onClick={() => {
                setTarget((current) => current ?? { interest, productId });
                setOpen(true);
              }}
              className="group flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent-gradient px-6 text-[15px] font-semibold focus-visible:outline-none! focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-accent-300">
              {target ? t("consultation.resume") : ts("getQuote")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs leading-relaxed text-ink-muted">
              <Clock3 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{t("consultation.responseTime")}
            </p>
          </div>
        </div>

        <div id={uid + "-form"} inert={open ? undefined : true} aria-hidden={!open}
          className={"grid transition-[grid-template-rows,opacity] duration-350 ease-in-out motion-reduce:transition-none " + (open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
          <div className="min-h-0 overflow-hidden">
            <div className="mb-5 flex min-h-9 items-center justify-between gap-3">
              <p className="text-[11px] font-semibold tracking-[0.12em] text-ink-muted uppercase [&:lang(th)]:tracking-normal">{t("eyebrow")}</p>
              <button type="button" onClick={close} aria-label={t("closePanel")}
                className="-mr-2 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-cloud hover:text-content">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {target && <HomeQuoteForm {...target} active={open} />}
          </div>
        </div>
      </div>
    </section>
  );
}

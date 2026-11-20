"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "framer-motion";
import { Check, X } from "lucide-react";
import type { QuoteRequest } from "@/lib/quoteRequest";
import HomeQuoteForm from "./HomeQuoteForm";
import LineChatButton from "./LineChatButton";
import { buttonClass } from "@/components/ui/Button";
import TextLink from "@/components/ui/TextLink";

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
      // on the page itself, not in a box: two columns with a hairline between
      className="grid border-b border-forest-100 lg:grid-cols-[0.9fr_1.1fr] dark:border-forest-700">
      <div className="flex flex-col py-8 lg:py-10 lg:pr-12">
        <h2 id={uid + "-title"} className="max-w-sm font-display text-title text-content">
          {t("consultation.title")}
        </h2>
        <p className="mt-4 max-w-md text-body text-ink-muted">{t("consultation.description")}</p>

        <ul aria-label={t("promisesLabel")} className="mt-6 flex flex-wrap gap-x-5 gap-y-3 lg:flex-col">
          {PROMISES.map((key) => (
            <li key={key} className="flex items-center gap-2.5 text-small font-medium text-content">
              <Check className="h-4 w-4 shrink-0 text-accent-600" strokeWidth={2.5} aria-hidden="true" />
              {t("promises." + key)}
            </li>
          ))}
        </ul>

        {/* ends where its content ends: no gap pushed open above LINE */}
        <div className="pt-7">
          <div className="border-t border-forest-100 pt-5">
            <div className="max-w-xs"><LineChatButton /></div>
            <p className="mt-4 flex flex-wrap items-center gap-x-1.5 text-small text-ink-muted">
              {ts("finderPrompt")}
              <TextLink href="/recommend">{ts("finderLink")}</TextLink>
            </p>
          </div>
        </div>
      </div>

      <div ref={panelRef} className="relative flex min-w-0 flex-col justify-center border-t border-forest-100 py-8 lg:border-t-0 lg:border-l lg:py-10 lg:pl-12 dark:border-forest-700"
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            event.stopPropagation();
            close();
          }
        }}>
        <div aria-hidden={open} inert={open ? true : undefined}
          className={"grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none " + (open ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100")}>
          <div className="min-h-0 overflow-hidden">
            <h3 className="font-display text-heading text-content">{t("consultation.previewTitle")}</h3>
            <p className="mt-2 text-small text-ink-muted">{t("consultation.previewBody")}</p>
            <ol className="my-7 space-y-5">
              {(["project", "contact"] as const).map((name, index) => (
                <li key={name} className="flex items-start gap-3">
                  <span className="w-4 shrink-0 text-small font-semibold tabular-nums text-ink-muted" aria-hidden="true">{index + 1}</span>
                  <div>
                    <p className="text-body font-semibold text-content">{t("consultation.steps." + name)}</p>
                    <p className="mt-0.5 text-small text-ink-muted">{t("consultation.previewSteps." + name)}</p>
                  </div>
                </li>
              ))}
            </ol>
            <button ref={triggerRef} type="button" aria-expanded={open} aria-controls={uid + "-form"}
              onClick={() => {
                setTarget((current) => current ?? { interest, productId });
                setOpen(true);
              }}
              className={buttonClass({ size: "lg", fullWidth: true })}>
              {target ? t("consultation.resume") : ts("getQuote")}
            </button>
            <p className="mt-3 text-center text-caption text-ink-muted">
              {t("consultation.responseTime")}
            </p>
          </div>
        </div>

        <div id={uid + "-form"} inert={open ? undefined : true} aria-hidden={!open}
          className={"grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none " + (open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
          <div className="min-h-0 overflow-hidden">
            <div className="mb-5 flex min-h-9 items-center justify-between gap-3">
              {/* the open form's title (Get a quote) */}
              <h3 className="text-small font-semibold text-content">{t("eyebrow")}</h3>
              <button type="button" onClick={close} aria-label={t("closePanel")}
                className="-mr-2 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-control text-ink-muted transition-[background-color,color,scale] duration-150 hover:bg-cloud hover:text-content active:scale-[0.97]">
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

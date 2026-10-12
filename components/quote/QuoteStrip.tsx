"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, PenLine, X } from "lucide-react";
import QuoteForm from "@/components/quote/QuoteForm";
import type { QuoteRequest } from "@/lib/quoteRequest";

/**
 * The hero's way into the quote form: one pill-shaped line, "your name or
 * phone", with a Get a quote button. Sending it (Enter or the button) opens
 * the full form in a card hanging under the strip, with what was typed
 * already filled in — a run of digits goes in as the phone number, anything
 * else as the name. Closed again, it's a single line; the form never sits on
 * the hero at full size.
 *
 * From lg the card floats centred under the bar, over a dimmed page (the
 * strip sits too low on the hero for a card under it to fit). Below lg it
 * opens in the flow and the page scrolls so its top sits under the bar.
 */
export default function QuoteStrip({
  interest,
  productId,
}: {
  /** The robot family on show, preselected in the form. */
  interest?: QuoteRequest["interest"];
  /** A single robot's slide: the form asks about that robot. */
  productId?: string;
}) {
  const t = useTranslations("heroQuote");
  const ts = useTranslations("showcase");
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");

  const close = () => {
    setOpen(false);
    inputRef.current?.focus();
  };

  // Open, the card closes on Escape or a click anywhere outside it.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Below lg the card opens in the flow, mostly under the fold: bring its top
  // just under the sticky bar. Only the window scrolls (not scrollIntoView,
  // which also scrolls clipped ancestors).
  useEffect(() => {
    if (!open || window.matchMedia("(min-width: 64rem)").matches) return;
    const timer = setTimeout(() => {
      const card = cardRef.current;
      if (!card) return;
      const barHeight = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      const top = card.getBoundingClientRect().top - barHeight - 12;
      if (Math.abs(top) < 4) return;
      window.scrollBy({ top, behavior: reduceMotion ? "instant" : "smooth" });
    }, 60);
    return () => clearTimeout(timer);
  }, [open, reduceMotion]);

  const value = typed.trim();
  // digits (with +, spaces or dashes) read as a phone number; anything else as a name
  const initial = /^\+?[\d\s-]{6,}$/.test(value) ? { phone: value } : value ? { fullName: value } : undefined;

  return (
    <div ref={rootRef} className="relative w-full max-w-xl">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setOpen(true);
        }}
        aria-label={t("eyebrow")}
        inert={open ? true : undefined}
        className={`flex h-14 items-center gap-2 rounded-full border border-forest-100 bg-surface/85 pr-1.5 pl-4 shadow-[0_14px_36px_-20px_rgb(10_26_74/0.5)] backdrop-blur-md transition-[opacity,border-color,box-shadow] duration-300 focus-within:border-accent/60 focus-within:shadow-[0_14px_36px_-20px_rgb(10_26_74/0.5),0_0_0_4px_rgb(var(--accent-rgb)/0.14)] ${
          open ? "opacity-50" : ""
        }`}
      >
        <PenLine className="h-4 w-4 shrink-0 text-accent-600" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          placeholder={t("stripPlaceholder")}
          aria-label={t("stripPlaceholder")}
          autoComplete="off"
          maxLength={80}
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-content placeholder:text-ink-muted focus:outline-none"
        />
        <button
          type="submit"
          className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-accent-gradient px-4 text-[14px] font-bold whitespace-nowrap sm:px-5"
        >
          {ts("getQuote")}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
      <p className="mt-2 pl-4 text-[12px] font-medium text-ink-muted">{t("reassure")}</p>

      <AnimatePresence>
        {open && (
          // Only opacity animates: a transform from framer would override the
          // centring translate the card relies on from lg.
          <motion.div
            key="card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          >
            {/* dims the page behind the floating card; a click on it closes */}
            <div
              aria-hidden="true"
              onClick={close}
              className="fixed inset-0 z-20 hidden bg-[#0a1a4a]/35 backdrop-blur-sm lg:block"
            />
            <div
              ref={cardRef}
              role="dialog"
              aria-label={t("eyebrow")}
              className="relative z-30 mt-3 w-full rounded-2xl border border-forest-100 bg-surface/95 p-5 shadow-[0_28px_70px_-28px_rgb(10_26_74/0.55),0_0_0_1px_rgb(var(--accent-rgb)/0.08)] backdrop-blur-xl lg:fixed lg:top-[calc(var(--nav-h)+1.5rem)] lg:left-1/2 lg:mt-0 lg:max-h-[calc(100svh-var(--nav-h)-3rem)] lg:w-[30rem] lg:-translate-x-1/2 lg:overflow-y-auto"
            >
            <div className="mb-1 flex items-start justify-between gap-3">
              <p className="font-display text-[19px] leading-tight font-extrabold tracking-tight text-content">
                {t("eyebrow")}
              </p>
              <button
                type="button"
                onClick={close}
                aria-label={t("closePanel")}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-cloud hover:text-content"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <QuoteForm variant="panel" interest={interest} productId={productId} initial={initial} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

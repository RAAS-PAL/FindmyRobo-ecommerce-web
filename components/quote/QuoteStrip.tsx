"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useReducedMotion } from "framer-motion";
import { ArrowRight, PenLine, X } from "lucide-react";
import QuoteForm from "@/components/quote/QuoteForm";
import type { QuoteRequest } from "@/lib/quoteRequest";

/**
 * The hero's way into the quote form ("unfold in place", 2026-10-12): a
 * pill that reads like an input — "your name or phone" and a Get a quote
 * button. Clicking anywhere on it unfolds the same box, in the page flow,
 * into the full form: the pill's line becomes the form's header with a
 * close button, the fields slide open beneath, and the page below moves
 * down to make room (no popup, no overlay). The hero folds its paragraph and
 * buttons away meanwhile (onOpenChange). If the form runs past the screen
 * the page scrolls just enough to show it. Closing (× or Escape) folds it
 * back to one line and keeps what was typed.
 */
export default function QuoteStrip({
  interest,
  productId,
  onOpenChange,
}: {
  /** The robot family on show, preselected in the form. */
  interest?: QuoteRequest["interest"];
  /** A single robot's slide: the form asks about that robot. */
  productId?: string;
  /** Told when the box unfolds or folds, so the hero can make room. */
  onOpenChange?: (open: boolean) => void;
}) {
  const t = useTranslations("heroQuote");
  const ts = useTranslations("showcase");
  const reduceMotion = useReducedMotion();
  const bodyId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const [open, setOpenState] = useState(false);
  // The form mounts on first open and then stays, so closing never loses
  // what was typed.
  const [mounted, setMounted] = useState(false);

  const setOpen = (next: boolean) => {
    setOpenState(next);
    if (next) setMounted(true);
    onOpenChange?.(next);
  };

  const close = () => {
    setOpen(false);
    // after the fold, back to the pill
    requestAnimationFrame(() => pillRef.current?.focus());
  };

  // Opened: the cursor goes to the first empty field, and once the box has
  // grown the page scrolls just enough to show it — its bottom on screen,
  // but never pushing its top under the bar. Only the window scrolls.
  useEffect(() => {
    if (!open) return;
    const focusTimer = setTimeout(() => {
      const fields = boxRef.current?.querySelectorAll<HTMLInputElement>("form input:not([type=hidden])");
      const firstEmpty = [...(fields ?? [])].find((field) => !field.value) ?? fields?.[0];
      firstEmpty?.focus({ preventScroll: true });
    }, 60);
    const scrollTimer = setTimeout(() => {
      const box = boxRef.current;
      if (!box) return;
      const rect = box.getBoundingClientRect();
      const barBottom = (document.querySelector("header")?.getBoundingClientRect().height ?? 0) + 16;
      const overflow = rect.bottom - (window.innerHeight - 24);
      const room = rect.top - barBottom;
      const by = rect.top < barBottom ? rect.top - barBottom : Math.min(Math.max(overflow, 0), room);
      if (Math.abs(by) > 4) window.scrollBy({ top: by, behavior: reduceMotion ? "instant" : "smooth" });
    }, reduceMotion ? 20 : 380);
    return () => {
      clearTimeout(focusTimer);
      clearTimeout(scrollTimer);
    };
  }, [open, reduceMotion]);

  return (
    <div className="w-full max-w-xl">
      <div
        ref={boxRef}
        onKeyDown={(event) => {
          if (event.key === "Escape" && open) {
            event.stopPropagation();
            close();
          }
        }}
        className={`overflow-hidden border bg-surface/85 backdrop-blur-md transition-[border-radius,box-shadow,border-color] duration-300 ease-out motion-reduce:transition-none ${
          open
            ? "rounded-2xl border-accent/40 shadow-[0_24px_60px_-28px_rgb(10_26_74/0.55),0_0_0_4px_rgb(var(--accent-rgb)/0.1)]"
            : "rounded-[28px] border-forest-100 shadow-[0_14px_36px_-20px_rgb(10_26_74/0.5)] hover:border-accent/50 hover:shadow-[0_14px_36px_-20px_rgb(10_26_74/0.5),0_0_0_4px_rgb(var(--accent-rgb)/0.1)]"
        }`}
      >
        {/* top line: the pill (closed) or the form's header (open), in the same place */}
        <div className="relative h-14">
          <button
            ref={pillRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls={bodyId}
            inert={open ? true : undefined}
            className={`group absolute inset-0 flex w-full cursor-text items-center gap-2 pr-1.5 pl-4 text-left transition-opacity duration-200 focus-visible:outline-none! ${
              open ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            <PenLine className="h-4 w-4 shrink-0 text-accent-600" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate text-[15px] text-ink-muted">{t("stripPlaceholder")}</span>
            <span className="flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-accent-gradient px-4 text-[14px] font-bold whitespace-nowrap group-focus-visible:ring-4 group-focus-visible:ring-accent/30 sm:px-5">
              {ts("getQuote")}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </button>

          <div
            aria-hidden={!open}
            className={`absolute inset-0 flex items-center justify-between gap-3 pr-2.5 pl-5 transition-opacity duration-200 ${
              open ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {/* the form itself says what it needs, just under this line */}
            <p className="min-w-0 truncate font-display text-[18px] leading-tight font-extrabold tracking-tight text-content">
              {t("eyebrow")}
            </p>
            <button
              type="button"
              onClick={close}
              tabIndex={open ? 0 : -1}
              aria-label={t("closePanel")}
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-cloud hover:text-content"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* the form, unfolding beneath (grid rows 0fr → 1fr animate to its height) */}
        <div
          id={bodyId}
          className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
          inert={open ? undefined : true}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="border-t border-forest-100 px-5 pt-1 pb-5">
              {mounted && <QuoteForm variant="panel" interest={interest} productId={productId} />}
            </div>
          </div>
        </div>
      </div>
      <p
        className={`pl-4 text-[12px] font-medium text-ink-muted transition-opacity duration-200 ${
          open ? "mt-0 h-0 opacity-0" : "mt-2 opacity-100"
        }`}
      >
        {t("reassure")}
      </p>
    </div>
  );
}

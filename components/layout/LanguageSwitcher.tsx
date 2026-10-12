"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Globe } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

/** Each language named in itself, so a visitor finds theirs whatever the page shows. */
const NAMES: Record<Locale, string> = { th: "ไทย", en: "English" };

/**
 * The language switch. It shows the language the page is in now; choosing
 * another keeps the current path.
 *
 * - "menu" (the navbar): a button with the current language opens a small
 *   list of the languages, the current one ticked. Hover opens it for a
 *   mouse; a click, tap or Enter opens and pins it until a click outside,
 *   Escape or tabbing away.
 * - "inline" (the phone drawer): both languages side by side, the current
 *   one filled — no menu inside a menu.
 */
export default function LanguageSwitcher({
  variant = "menu",
  className = "",
}: {
  variant?: "menu" | "inline";
  className?: string;
}) {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  if (variant === "inline") {
    return (
      <div
        role="group"
        aria-label={t("language")}
        className={`inline-flex items-center gap-1 rounded-full border border-forest-100 p-1 ${className}`}
      >
        <Globe className="mx-2 h-4 w-4 text-ink-muted" aria-hidden="true" />
        {routing.locales.map((l) => {
          const current = l === locale;
          return (
            <Link
              key={l}
              href={pathname}
              locale={l}
              lang={l}
              aria-current={current ? "true" : undefined}
              className={`flex min-h-10 items-center rounded-full px-4 text-[13.5px] font-semibold transition-colors ${
                current ? "bg-accent text-on-accent" : "text-content hover:bg-cloud"
              }`}
            >
              {NAMES[l]}
            </Link>
          );
        })}
      </div>
    );
  }

  return <LanguageMenu className={className} />;
}

function LanguageMenu({ className }: { className: string }) {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const pinned = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const clearTimer = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const close = () => {
    clearTimer();
    pinned.current = false;
    setOpen(false);
  };

  // Open, the list closes on a click outside or on Escape.
  useEffect(() => {
    if (!open) return;
    const dismiss = () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      pinned.current = false;
      setOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) dismiss();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismiss();
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => clearTimer, []);

  return (
    <div
      ref={rootRef}
      className={`relative ${className}`}
      onPointerEnter={(event) => {
        if (event.pointerType !== "mouse") return;
        clearTimer();
        setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "mouse" || pinned.current) return;
        clearTimer();
        // a short delay, so crossing the gap down to the list doesn't close it
        closeTimer.current = setTimeout(() => setOpen(false), 220);
      }}
      onBlur={(event) => {
        if (open && !event.currentTarget.contains(event.relatedTarget as Node | null)) close();
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          clearTimer();
          // a click on a hover-opened list pins it instead of closing it
          if (open && !pinned.current) {
            pinned.current = true;
            return;
          }
          pinned.current = !open;
          setOpen(!open);
        }}
        aria-label={`${t("language")}: ${NAMES[locale]}`}
        aria-expanded={open}
        aria-controls={listId}
        className={`flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-[13.5px] font-semibold transition-colors hover:bg-cloud ${
          open ? "bg-cloud text-content" : "text-content/85 hover:text-content"
        }`}
      >
        <Globe className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span lang={locale}>{NAMES[locale]}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 opacity-70 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          // pt-2 instead of a margin: the gap stays part of the hover area
          <motion.div
            id={listId}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-50 pt-2"
          >
            <ul className="w-44 overflow-hidden rounded-xl border border-forest-100 bg-surface/95 p-1.5 shadow-[0_24px_48px_-20px_rgba(0,0,0,0.28)] backdrop-blur-xl">
              {routing.locales.map((l) => {
                const current = l === locale;
                return (
                  <li key={l}>
                    <Link
                      href={pathname}
                      locale={l}
                      lang={l}
                      onClick={close}
                      aria-current={current ? "true" : undefined}
                      className={`flex min-h-[42px] items-center justify-between gap-3 rounded-lg px-3 text-[14px] transition-colors hover:bg-cloud ${
                        current ? "font-bold text-accent-600" : "font-semibold text-content"
                      }`}
                    >
                      {NAMES[l]}
                      {current && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

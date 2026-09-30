"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Moon, User, UserRound } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { createClient } from "@/lib/supabase/client";

/**
 * The navbar's profile icon. Hovering it opens a small panel — sign in and
 * create account when signed out, the account page and sign out when signed
 * in — and the light/dark switch, which lives here rather than on the bar.
 *
 * Hover only opens it for a mouse. A click, tap or Enter opens it and pins
 * it, so it stays until you click elsewhere, press Escape or tab away (a
 * click on an already hover-opened panel just pins it, instead of closing
 * it under the cursor).
 */
export default function ProfileMenu() {
  const t = useTranslations("nav");
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const pinned = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    const supabase = createClient();
    const apply = (user: { email?: string } | null | undefined) => {
      setSignedIn(!!user);
      setEmail(user?.email ?? null);
    };
    supabase.auth.getUser().then(({ data }) => apply(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => apply(session?.user));
    return () => subscription.unsubscribe();
  }, []);

  const clearTimer = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const close = () => {
    clearTimer();
    pinned.current = false;
    setOpen(false);
  };

  // A pinned panel closes on a click/tap outside it or on Escape.
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

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    []
  );

  const signOut = async () => {
    close();
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  };

  const itemClass =
    "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold text-content/85 transition-colors hover:bg-cloud hover:text-accent-600";

  return (
    <div
      ref={rootRef}
      className="relative"
      onPointerEnter={(event) => {
        if (event.pointerType !== "mouse") return;
        clearTimer();
        setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "mouse" || pinned.current) return;
        clearTimer();
        // a short delay, so crossing the gap down to the panel doesn't close it
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
          if (open && !pinned.current) {
            pinned.current = true;
            return;
          }
          pinned.current = !open;
          setOpen(!open);
        }}
        aria-label={t("profileMenu")}
        aria-expanded={open}
        aria-controls={panelId}
        className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-cloud hover:text-accent-600 ${
          open ? "bg-cloud text-accent-600" : "text-content"
        }`}
      >
        <User className="h-5 w-5" aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          // pt-2 instead of a margin: the gap stays part of the hover area
          <motion.div
            id={panelId}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-50 pt-2"
          >
            <div className="w-64 overflow-hidden rounded-xl border border-forest-100 bg-surface/95 p-2 shadow-[0_24px_48px_-20px_rgba(0,0,0,0.28)] backdrop-blur-xl">
              {signedIn ? (
                <>
                  {email && (
                    <p className="px-3 pt-1.5 pb-2 text-[12px] leading-snug text-ink-muted">
                      {t("signedInAs")}
                      <span className="block truncate font-semibold text-content">{email}</span>
                    </p>
                  )}
                  <Link href="/account" onClick={close} className={itemClass}>
                    <UserRound className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {t("account")}
                  </Link>
                  <button type="button" onClick={signOut} className={itemClass}>
                    <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {t("signOut")}
                  </button>
                </>
              ) : (
                <div className="space-y-2 p-1.5">
                  <Link
                    href="/login"
                    onClick={close}
                    className="flex min-h-[44px] items-center justify-center rounded-full bg-accent px-5 text-[13.5px] font-bold text-on-accent transition-colors hover:bg-accent-strong"
                  >
                    {t("signIn")}
                  </Link>
                  <Link
                    href="/signup"
                    onClick={close}
                    className="flex min-h-[44px] items-center justify-center rounded-full border border-forest-100 px-5 text-[13.5px] font-semibold text-content transition-colors hover:border-accent hover:text-accent-600"
                  >
                    {t("createAccount")}
                  </Link>
                </div>
              )}

              <div className="mx-1 my-1.5 h-px bg-forest-100" />

              <button
                type="button"
                role="switch"
                aria-checked={isDark}
                onClick={toggle}
                className={`${itemClass} justify-between`}
              >
                <span className="flex items-center gap-3">
                  <Moon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {t("darkMode")}
                </span>
                <span
                  aria-hidden="true"
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                    isDark ? "bg-accent" : "bg-forest-100"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      isDark ? "translate-x-4" : ""
                    }`}
                  />
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

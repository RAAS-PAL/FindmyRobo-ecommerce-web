"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";

/**
 * Admin-wide "are you sure?" dialog.
 *
 * Destructive admin actions used to fire on the first click — a mis-click on a
 * page-builder bin icon removed a whole section with no way back. `confirm()`
 * returns a promise that resolves true/false, so a caller reads like a guard:
 *
 *   if (!(await confirm({ ... }))) return;
 *
 * A real dialog rather than window.confirm: the native one can't be styled,
 * is suppressible per-origin in some browsers ("prevent this page from
 * creating additional dialogs"), and blocks the main thread while open.
 */

interface ConfirmOptions {
  title: string;
  message: string;
  /** Label for the destructive button, e.g. "Delete". */
  confirmLabel: string;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const fn = useContext(ConfirmContext);
  if (!fn) {
    throw new Error("useConfirm must be used inside <ConfirmProvider>");
  }
  return fn;
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

export default function ConfirmProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("admin.confirmDialog");
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  // Cancel is focused on open, not the destructive button: an admin hitting
  // Enter out of habit should get the safe outcome.
  const cancelRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback<ConfirmFn>(
    (options) =>
      new Promise<boolean>((resolve) => setPending({ ...options, resolve })),
    []
  );

  const settle = useCallback(
    (value: boolean) => {
      setPending((current) => {
        current?.resolve(value);
        return null;
      });
    },
    []
  );

  useEffect(() => {
    if (!pending) return;
    cancelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") settle(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pending, settle]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => settle(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-forest-100 bg-surface p-6 shadow-2xl sm:p-7"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/15">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2
                  id="confirm-title"
                  className="font-display text-lg font-bold text-content"
                >
                  {pending.title}
                </h2>
                <p
                  id="confirm-message"
                  className="mt-2 text-[14px] leading-relaxed text-ink-muted"
                >
                  {pending.message}
                </p>
              </div>
            </div>
            <div className="mt-7 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <button
                ref={cancelRef}
                type="button"
                onClick={() => settle(false)}
                className="min-h-[44px] cursor-pointer rounded-full border border-forest-100 px-6 text-[14px] font-semibold text-content transition-colors hover:bg-cloud"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={() => settle(true)}
                className="min-h-[44px] cursor-pointer rounded-full bg-red-600 px-6 text-[14px] font-bold text-white transition-colors hover:bg-red-700"
              >
                {pending.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

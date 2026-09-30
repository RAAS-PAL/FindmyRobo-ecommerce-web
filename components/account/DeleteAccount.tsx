"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import AccountSection from "@/components/account/AccountSection";

export default function DeleteAccount({ email }: { email: string }) {
  const t = useTranslations("auth.account.settings");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Typing the address is deliberately more friction than an "are you sure?"
  // dialog — this is irreversible and takes the customer's addresses and
  // reviews with it.
  const confirmed = typed.trim().toLowerCase() === email.trim().toLowerCase();

  const remove = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/account", { method: "DELETE" });
      if (!response.ok) throw new Error("server");
      // The account is gone; clear the local session before leaving so the
      // stale cookie can't linger on a shared machine.
      await createClient().auth.signOut();
      router.push("/");
      router.refresh();
    } catch {
      setError(t("errors.deleteFailed"));
      setBusy(false);
    }
  };

  return (
    <AccountSection
      headingId="delete-account-heading"
      eyebrow={t("dangerEyebrow")}
      heading={t("deleteHeading")}
      sub={t("deleteSub")}
      tone="danger"
    >
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-full border border-red-200 px-6 text-[13px] font-bold text-red-600 transition-colors hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          {t("deleteCta")}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50/60 p-4">
            <AlertTriangle
              className="mt-0.5 h-4.5 w-4.5 shrink-0 text-red-600"
              aria-hidden="true"
            />
            <div className="text-[12.5px] leading-relaxed text-content">
              <p className="font-semibold text-red-700">{t("deleteWarningTitle")}</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-ink-muted">
                <li>{t("deleteWarningProfile")}</li>
                <li>{t("deleteWarningAddresses")}</li>
                <li>{t("deleteWarningReviews")}</li>
                <li>{t("deleteWarningOrders")}</li>
              </ul>
            </div>
          </div>

          <div>
            <label
              htmlFor="delete-confirm"
              className="mb-1.5 block text-[13px] font-semibold text-content"
            >
              {t("deleteConfirmLabel", { email })}
            </label>
            <input
              id="delete-confirm"
              autoComplete="off"
              value={typed}
              onChange={(e) => {
                setTyped(e.target.value);
                setError(null);
              }}
              className="min-h-12 w-full rounded-xl border border-red-200 bg-surface px-4 text-sm text-content transition-colors focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200"
            />
          </div>

          {error && (
            <p role="alert" className="text-[12.5px] font-medium text-red-600">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={remove}
              disabled={busy || !confirmed}
              className="flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-full bg-red-600 px-6 text-[13px] font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              )}
              {t("deleteConfirmCta")}
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setTyped("");
                setError(null);
              }}
              disabled={busy}
              className="min-h-[46px] cursor-pointer rounded-full border border-forest-100 px-6 text-[13px] font-bold text-content transition-colors hover:border-accent hover:text-accent-600"
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      )}
    </AccountSection>
  );
}

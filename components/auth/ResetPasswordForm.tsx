"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "min-h-[48px] w-full rounded-xl border border-forest-100 bg-surface px-4 text-[14px] text-content transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25";

export default function ResetPasswordForm() {
  const t = useTranslations("auth.resetPassword");
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirm) {
      setError(t("mismatch"));
      return;
    }
    setBusy(true);
    setError(null);

    // The recovery token was already exchanged for a session by /auth/confirm,
    // so this updates the currently signed-in user.
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(t("error"));
      setBusy(false);
      return;
    }

    router.push("/account");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-[13px] font-semibold text-content"
        >
          {t("password")}
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(null);
          }}
          className={inputClass}
        />
        <p className="mt-1 text-[11.5px] text-ink-muted">{t("passwordHint")}</p>
      </div>
      <div>
        <label
          htmlFor="confirm"
          className="mb-1.5 block text-[13px] font-semibold text-content"
        >
          {t("confirm")}
        </label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            setError(null);
          }}
          aria-invalid={mismatch}
          className={inputClass}
        />
        {mismatch && (
          <p className="mt-1 text-[11.5px] font-medium text-red-600">{t("mismatch")}</p>
        )}
      </div>
      {error && (
        <p role="alert" className="text-[12.5px] font-medium text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || password.length < 8 || password !== confirm}
        className="flex min-h-[50px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-accent text-[14px] font-bold text-on-accent transition-all duration-300 hover:shadow-[0_0_28px_-4px_rgb(var(--accent-rgb)/0.65)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        )}
        {t("submit")}
      </button>
    </form>
  );
}

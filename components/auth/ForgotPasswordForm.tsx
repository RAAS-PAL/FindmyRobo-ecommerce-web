"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { KeyRound, LoaderCircle, MailCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "min-h-[48px] w-full rounded-xl border border-forest-100 bg-surface px-4 text-[14px] text-content transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25";

export default function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);

    // The recovery link lands on /auth/confirm, which verifies the token and
    // then forwards to /reset-password with a live session.
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
    });

    // Always show the same confirmation, even when the address has no account.
    // Diverging here would turn this form into a way to test which emails are
    // registered customers.
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/20">
          <MailCheck className="h-7 w-7 text-gold-600" aria-hidden="true" />
        </span>
        <h2 className="font-display text-xl font-bold text-content">
          {t("checkEmailTitle")}
        </h2>
        <p className="text-[13.5px] leading-relaxed text-ink-muted">
          {t("checkEmailBody", { email })}
        </p>
        <Link
          href="/login"
          className="text-[13px] font-semibold text-gold-600 hover:underline"
        >
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-[13px] font-semibold text-content"
        >
          {t("email")}
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={busy || !email}
        className="flex min-h-[50px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gold text-[14px] font-bold text-forest-950 transition-all duration-300 hover:shadow-[0_0_28px_-4px_rgba(245,200,66,0.65)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <KeyRound className="h-4 w-4" aria-hidden="true" />
        )}
        {t("submit")}
      </button>
      <p className="pt-1 text-center text-[13px] text-ink-muted">
        <Link href="/login" className="font-semibold text-gold-600 hover:underline">
          {t("backToLogin")}
        </Link>
      </p>
    </form>
  );
}

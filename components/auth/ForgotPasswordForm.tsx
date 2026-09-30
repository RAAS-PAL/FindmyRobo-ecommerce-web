"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { KeyRound, LoaderCircle, MailCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import Turnstile, { captchaEnabled } from "@/components/auth/Turnstile";

const inputClass =
  "min-h-[48px] w-full rounded-xl border border-forest-100 bg-surface px-4 text-[14px] text-content transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25";

export default function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);

    // The recovery link lands on /auth/confirm, which verifies the token and
    // then forwards to /reset-password with a live session.
    // Password recovery is also behind Supabase's captcha protection when it is
    // enabled — omitting the token means the email is never generated.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
      ...(captchaToken ? { captchaToken } : {}),
    });

    if (error) {
      // Real failures (redirect URL not allowlisted, rate limit, SMTP down)
      // must not be swallowed — silently showing "check your email" makes a
      // broken reset flow indistinguishable from a working one.
      console.error("[reset] resetPasswordForEmail failed:", error);
      // Single-use token spent on that attempt — reissue for any retry.
      setCaptchaToken(null);
      setCaptchaKey((k) => k + 1);

      // Rate limiting is the one case worth telling the user about: it is
      // their own repeated attempts, and staying silent makes them retry
      // harder. Everything else stays generic so this form can't be used to
      // discover which addresses are registered.
      if (error.status === 429 || /rate|too many/i.test(error.message)) {
        setError(t("rateLimited"));
        setBusy(false);
        return;
      }
    }

    // Same confirmation whether or not the address has an account — diverging
    // here would turn this form into a way to test which emails are customers.
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/20">
          <MailCheck className="h-7 w-7 text-accent-600" aria-hidden="true" />
        </span>
        <h2 className="font-display text-xl font-bold text-content">
          {t("checkEmailTitle")}
        </h2>
        <p className="text-[13.5px] leading-relaxed text-ink-muted">
          {t("checkEmailBody", { email })}
        </p>
        <Link
          href="/login"
          className="text-[13px] font-semibold text-accent-600 hover:underline"
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
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          className={inputClass}
        />
      </div>
      <Turnstile onToken={setCaptchaToken} resetKey={captchaKey} />
      {error && (
        <p role="alert" className="text-[12.5px] font-medium text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || !email || (captchaEnabled && !captchaToken)}
        className="flex min-h-[50px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-accent text-[14px] font-bold text-on-accent transition-all duration-300 hover:shadow-[0_0_28px_-4px_rgb(var(--accent-rgb)/0.65)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <KeyRound className="h-4 w-4" aria-hidden="true" />
        )}
        {t("submit")}
      </button>
      <p className="pt-1 text-center text-[13px] text-ink-muted">
        <Link href="/login" className="font-semibold text-accent-600 hover:underline">
          {t("backToLogin")}
        </Link>
      </p>
    </form>
  );
}

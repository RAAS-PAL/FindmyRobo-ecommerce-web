"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LoaderCircle, LogIn } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import Turnstile, { captchaEnabled } from "@/components/auth/Turnstile";

const inputClass =
  "min-h-[48px] w-full rounded-xl border border-forest-100 bg-surface px-4 text-[14px] text-content transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25";

export default function LoginForm() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    // Supabase's captcha protection covers sign-in, not just signup — without a
    // token here every login is rejected once it is switched on.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
      ...(captchaToken ? { options: { captchaToken } } : {}),
    });

    if (signInError) {
      console.error("[login] signInWithPassword failed:", signInError);
      setError(
        signInError.code === "email_not_confirmed" ? t("unconfirmed") : t("error")
      );
      // The token was spent on that attempt; issue a fresh challenge so a retry
      // isn't rejected for a reason the customer can't see.
      setCaptchaToken(null);
      setCaptchaKey((k) => k + 1);
      setBusy(false);
      return;
    }

    router.push("/account");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold text-content">
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
      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <label htmlFor="password" className="text-[13px] font-semibold text-content">
            {t("password")}
          </label>
          <Link
            href="/forgot-password"
            className="text-[12px] font-semibold text-accent-600 hover:underline"
          >
            {t("forgotLink")}
          </Link>
        </div>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
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
        disabled={busy || !email || !password || (captchaEnabled && !captchaToken)}
        className="flex min-h-[50px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-accent text-[14px] font-bold text-on-accent transition-all duration-300 hover:shadow-[0_0_28px_-4px_rgb(var(--accent-rgb)/0.65)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <LogIn className="h-4 w-4" aria-hidden="true" />
        )}
        {t("submit")}
      </button>
      <p className="pt-1 text-center text-[13px] text-ink-muted">
        {t("noAccount")}{" "}
        <Link href="/signup" className="font-semibold text-accent-600 hover:underline">
          {t("signupLink")}
        </Link>
      </p>
    </form>
  );
}

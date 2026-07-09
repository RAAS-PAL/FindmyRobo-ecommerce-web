"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LoaderCircle, MailCheck, UserPlus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "min-h-[48px] w-full rounded-xl border border-forest-100 bg-white px-4 text-[14px] text-forest transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25";

export default function SignupForm() {
  const t = useTranslations("auth.signup");
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (signUpError) {
      setError(t("error"));
      setBusy(false);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/20">
          <MailCheck className="h-7 w-7 text-gold-600" aria-hidden="true" />
        </span>
        <h2 className="font-display text-xl font-bold text-forest">
          {t("checkEmailTitle")}
        </h2>
        <p className="text-[13.5px] leading-relaxed text-ink-muted">
          {t("checkEmailBody", { email })}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="mb-1.5 block text-[13px] font-semibold text-forest">
          {t("fullName")}
        </label>
        <input
          id="fullName"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold text-forest">
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
        <label htmlFor="password" className="mb-1.5 block text-[13px] font-semibold text-forest">
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
      {error && (
        <p role="alert" className="text-[12.5px] font-medium text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || !fullName || !email || password.length < 8}
        className="flex min-h-[50px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gold text-[14px] font-bold text-forest-950 transition-all duration-300 hover:shadow-[0_0_28px_-4px_rgba(245,200,66,0.65)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <UserPlus className="h-4 w-4" aria-hidden="true" />
        )}
        {t("submit")}
      </button>
      <p className="pt-1 text-center text-[13px] text-ink-muted">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-semibold text-gold-600 hover:underline">
          {t("loginLink")}
        </Link>
      </p>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, KeyRound, LoaderCircle, LogOut, Mail } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import AccountSection from "@/components/account/AccountSection";
import Turnstile, { captchaEnabled } from "@/components/auth/Turnstile";

const inputClass =
  "min-h-12 w-full rounded-xl border border-forest-100 bg-surface px-4 text-sm text-content placeholder:text-ink-muted/50 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25";

const buttonClass =
  "flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-full bg-gold px-6 text-[13px] font-bold text-forest-950 transition-all duration-300 hover:shadow-[0_0_28px_-4px_rgba(245,200,66,0.65)] disabled:cursor-not-allowed disabled:opacity-50";

export default function SecuritySettings({
  currentEmail,
}: {
  currentEmail: string;
}) {
  const t = useTranslations("auth.account.settings");
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState(currentEmail);
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwDone, setPwDone] = useState(false);

  const [signOutBusy, setSignOutBusy] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);

  const mismatch = confirm.length > 0 && next !== confirm;

  const changeEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    setEmailBusy(true);
    setEmailError(null);
    setEmailSent(false);

    const { error } = await supabase.auth.updateUser(
      { email },
      { emailRedirectTo: `${window.location.origin}/auth/confirm?next=/account` }
    );

    if (error) {
      setEmailError(
        error.message.toLowerCase().includes("already")
          ? t("errors.emailTaken")
          : t("errors.emailChange")
      );
      setEmailBusy(false);
      return;
    }
    setEmailSent(true);
    setEmailBusy(false);
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (next !== confirm) {
      setPwError(t("errors.mismatch"));
      return;
    }
    setPwBusy(true);
    setPwError(null);
    setPwDone(false);

    // Supabase has no "verify password" call, so re-authenticating with the
    // current one is how we prove the person at the keyboard is the account
    // owner rather than someone using a session left open on a shared machine.
    // This is a sign-in call, so it sits behind Supabase's captcha protection
    // alongside login and password recovery.
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password: current,
      ...(captchaToken ? { options: { captchaToken } } : {}),
    });
    if (reauthError) {
      console.error("[security] re-auth failed:", reauthError);
      setPwError(t("errors.wrongPassword"));
      setCaptchaToken(null);
      setCaptchaKey((k) => k + 1);
      setPwBusy(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: next });
    if (error) {
      setPwError(t("errors.passwordChange"));
      setPwBusy(false);
      return;
    }

    setCurrent("");
    setNext("");
    setConfirm("");
    setPwDone(true);
    setPwBusy(false);
  };

  const signOutEverywhere = async () => {
    setSignOutBusy(true);
    await supabase.auth.signOut({ scope: "global" });
    router.push("/login");
    router.refresh();
  };

  return (
    <AccountSection
      headingId="security-settings-heading"
      eyebrow={t("securityEyebrow")}
      heading={t("securityHeading")}
      sub={t("securitySub")}
    >
      <div className="space-y-8">
        {/* email */}
        <form onSubmit={changeEmail} className="space-y-3">
          <label
            htmlFor="settings-email"
            className="block text-[13px] font-semibold text-content"
          >
            {t("email")}
          </label>
          <input
            id="settings-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(null);
              setEmailSent(false);
            }}
            className={inputClass}
          />
          <p className="text-[11.5px] leading-relaxed text-ink-muted">
            {t("emailHint")}
          </p>
          {emailError && (
            <p role="alert" className="text-[12.5px] font-medium text-red-600">
              {emailError}
            </p>
          )}
          {emailSent && (
            <p
              aria-live="polite"
              className="flex items-start gap-1.5 text-[12.5px] font-medium text-forest-700"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {t("emailSent", { email })}
            </p>
          )}
          <button
            type="submit"
            disabled={emailBusy || !email || email === currentEmail}
            className={buttonClass}
          >
            {emailBusy ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Mail className="h-4 w-4" aria-hidden="true" />
            )}
            {t("changeEmail")}
          </button>
        </form>

        <hr className="border-forest-100" />

        {/* password */}
        <form onSubmit={changePassword} className="space-y-3">
          <p className="text-[13px] font-semibold text-content">{t("passwordHeading")}</p>
          <div>
            <label htmlFor="settings-current-pw" className="sr-only">
              {t("currentPassword")}
            </label>
            <input
              id="settings-current-pw"
              type="password"
              autoComplete="current-password"
              required
              placeholder={t("currentPassword")}
              value={current}
              onChange={(e) => {
                setCurrent(e.target.value);
                setPwError(null);
                setPwDone(false);
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="settings-new-pw" className="sr-only">
              {t("newPassword")}
            </label>
            <input
              id="settings-new-pw"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder={t("newPassword")}
              value={next}
              onChange={(e) => {
                setNext(e.target.value);
                setPwError(null);
                setPwDone(false);
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="settings-confirm-pw" className="sr-only">
              {t("confirmPassword")}
            </label>
            <input
              id="settings-confirm-pw"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder={t("confirmPassword")}
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setPwError(null);
                setPwDone(false);
              }}
              aria-invalid={mismatch}
              className={inputClass}
            />
            <p className="mt-1 text-[11.5px] text-ink-muted">{t("passwordHint")}</p>
          </div>
          <Turnstile onToken={setCaptchaToken} resetKey={captchaKey} />
          {pwError && (
            <p role="alert" className="text-[12.5px] font-medium text-red-600">
              {pwError}
            </p>
          )}
          {pwDone && (
            <p
              aria-live="polite"
              className="flex items-center gap-1.5 text-[12.5px] font-medium text-forest-700"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              {t("passwordChanged")}
            </p>
          )}
          <button
            type="submit"
            disabled={
              pwBusy ||
              !current ||
              next.length < 8 ||
              next !== confirm ||
              (captchaEnabled && !captchaToken)
            }
            className={buttonClass}
          >
            {pwBusy ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <KeyRound className="h-4 w-4" aria-hidden="true" />
            )}
            {t("changePassword")}
          </button>
        </form>

        <hr className="border-forest-100" />

        {/* sessions */}
        <div className="space-y-3">
          <p className="text-[13px] font-semibold text-content">{t("sessionsHeading")}</p>
          <p className="text-[11.5px] leading-relaxed text-ink-muted">
            {t("sessionsHint")}
          </p>
          <button
            type="button"
            onClick={signOutEverywhere}
            disabled={signOutBusy}
            className="flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-full border border-forest-100 px-6 text-[13px] font-bold text-content transition-colors hover:border-gold hover:text-gold-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {signOutBusy ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="h-4 w-4" aria-hidden="true" />
            )}
            {t("signOutEverywhere")}
          </button>
        </div>
      </div>
    </AccountSection>
  );
}

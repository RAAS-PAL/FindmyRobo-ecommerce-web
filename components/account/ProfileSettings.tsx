"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, LoaderCircle, Save } from "lucide-react";
import AccountSection from "@/components/account/AccountSection";

const inputClass =
  "min-h-12 w-full rounded-xl border border-forest-100 bg-surface px-4 text-sm text-content placeholder:text-ink-muted/50 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25";

export interface ProfileFormValues {
  fullName: string;
  phone: string;
  marketingOptIn: boolean;
}

export default function ProfileSettings({
  initial,
}: {
  initial: ProfileFormValues;
}) {
  const t = useTranslations("auth.account.settings");
  const [values, setValues] = useState<ProfileFormValues>(initial);
  const [saved, setSaved] = useState<ProfileFormValues>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const dirty =
    values.fullName !== saved.fullName ||
    values.phone !== saved.phone ||
    values.marketingOptIn !== saved.marketingOptIn;

  const set = <K extends keyof ProfileFormValues>(
    key: K,
    value: ProfileFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setError(null);
    setDone(false);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? "server");
      setSaved(values);
      setDone(true);
    } catch (cause) {
      const key = cause instanceof Error ? cause.message : "server";
      setError(
        key === "invalid_name" || key === "invalid_phone" ? t(`errors.${key}`) : t("errors.server")
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AccountSection
      headingId="profile-settings-heading"
      eyebrow={t("detailsEyebrow")}
      heading={t("detailsHeading")}
      sub={t("detailsSub")}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label
            htmlFor="settings-name"
            className="mb-1.5 block text-[13px] font-semibold text-content"
          >
            {t("fullName")}
          </label>
          <input
            id="settings-name"
            autoComplete="name"
            required
            maxLength={80}
            value={values.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="settings-phone"
            className="mb-1.5 block text-[13px] font-semibold text-content"
          >
            {t("phone")}
          </label>
          <input
            id="settings-phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder={t("phonePlaceholder")}
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-[11.5px] text-ink-muted">{t("phoneHint")}</p>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-forest-100 p-4 transition-colors hover:border-accent/50">
          <input
            type="checkbox"
            checked={values.marketingOptIn}
            onChange={(e) => set("marketingOptIn", e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
          />
          <span>
            <span className="block text-[13px] font-semibold text-content">
              {t("marketing")}
            </span>
            <span className="mt-0.5 block text-[11.5px] leading-relaxed text-ink-muted">
              {t("marketingHint")}
            </span>
          </span>
        </label>

        {error && (
          <p role="alert" className="text-[12.5px] font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy || !dirty || !values.fullName.trim()}
            className="flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-6 text-[13px] font-bold text-on-accent transition-all duration-300 hover:shadow-[0_0_28px_-4px_rgb(var(--accent-rgb)/0.65)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            {t("save")}
          </button>
          <p aria-live="polite" className="text-[12.5px] font-medium text-forest-700">
            {done && !dirty && (
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4" aria-hidden="true" />
                {t("savedMessage")}
              </span>
            )}
          </p>
        </div>
      </form>
    </AccountSection>
  );
}

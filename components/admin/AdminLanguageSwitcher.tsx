"use client";

import { useState } from "react";
import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";

export default function AdminLanguageSwitcher({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("admin.navigation");
  const nextLocale: Locale = locale === "th" ? "en" : "th";
  const [busy, setBusy] = useState(false);

  const switchLanguage = async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/admin/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: nextLocale }),
      });
      if (!response.ok) throw new Error("Could not change admin language");
      window.location.reload();
    } catch {
      window.alert(t("switchError"));
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={switchLanguage}
      disabled={busy}
      aria-label={t("switchLanguage")}
      title={t("switchLanguage")}
      className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-full px-3.5 text-[13px] font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${
        variant === "dark"
          ? "text-white/80 hover:bg-white/10 hover:text-gold"
          : "border border-forest-100 bg-surface text-content hover:border-gold hover:text-gold-600"
      }`}
    >
      <Languages className="h-4 w-4" aria-hidden="true" />
      {t("switchLocale")}
    </button>
  );
}

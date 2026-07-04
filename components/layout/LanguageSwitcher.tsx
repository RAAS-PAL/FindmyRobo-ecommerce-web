"use client";

import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";

/** Toggles between Thai and English, preserving the current path. */
export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const other = locale === "th" ? "en" : "th";

  return (
    <Link
      href={pathname}
      locale={other}
      aria-label={other === "th" ? "เปลี่ยนเป็นภาษาไทย" : "Switch to English"}
      className={`flex min-h-[44px] items-center gap-1.5 rounded-full border border-white/15 px-3.5 font-mono text-[12px] font-semibold uppercase tracking-wider text-white/80 transition-colors hover:border-gold hover:text-gold ${className}`}
    >
      <Globe className="h-4 w-4" aria-hidden="true" />
      {t("switchLocale")}
    </Link>
  );
}

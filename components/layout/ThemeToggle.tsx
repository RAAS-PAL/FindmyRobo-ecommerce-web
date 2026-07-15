"use client";

import { useTranslations } from "next-intl";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const t = useTranslations("nav");
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? t("themeToLight") : t("themeToDark")}
      title={isDark ? t("themeToLight") : t("themeToDark")}
      className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-forest-100 text-content transition-colors hover:border-gold hover:text-gold-600 ${className}`}
    >
      {isDark ? (
        <Sun className="h-4.5 w-4.5" aria-hidden="true" />
      ) : (
        <Moon className="h-4.5 w-4.5" aria-hidden="true" />
      )}
    </button>
  );
}

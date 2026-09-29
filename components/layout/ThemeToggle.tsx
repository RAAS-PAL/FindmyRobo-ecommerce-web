"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const SKINS = {
  /** On light page chrome (storefront navbar). */
  storefront: "border border-forest-100 text-content hover:border-gold hover:text-gold-600",
  /** On a permanently dark bar (admin header stays forest-950 in both themes). */
  onDark: "text-white/80 hover:bg-white/10 hover:text-gold",
} as const;

/**
 * Labels are passed in rather than read from next-intl, because the admin
 * panel has its own html root outside NextIntlClientProvider and would crash
 * on useTranslations.
 */
export function ThemeToggleButton({
  toDark,
  toLight,
  variant = "storefront",
  className = "",
}: {
  toDark: string;
  toLight: string;
  variant?: keyof typeof SKINS;
  className?: string;
}) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? toLight : toDark;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-colors ${SKINS[variant]} ${className}`}
    >
      {isDark ? (
        <Sun className="h-4.5 w-4.5" aria-hidden="true" />
      ) : (
        <Moon className="h-4.5 w-4.5" aria-hidden="true" />
      )}
    </button>
  );
}

import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["th", "en"],
  defaultLocale: "th",
  // Thai (default) lives at "/", English at "/en"
  localePrefix: "as-needed",
  // Always serve Thai at "/" — don't redirect based on browser language.
  // Visitors switch via the EN/ไทย toggle (choice is remembered in a cookie).
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];

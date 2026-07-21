import "server-only";

import { cookies } from "next/headers";
import { hasLocale } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";

export const adminLocaleCookieName = "ADMIN_LOCALE";

export async function getAdminLocale(): Promise<Locale> {
  const storedLocale = (await cookies()).get(adminLocaleCookieName)?.value;
  return hasLocale(routing.locales, storedLocale)
    ? storedLocale
    : "en";
}

import { hasLocale } from "next-intl";
import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { adminLocaleCookieName } from "@/lib/adminLocale";

export async function POST(request: Request) {
  let locale: unknown;
  try {
    ({ locale } = (await request.json()) as { locale?: unknown });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (typeof locale !== "string" || !hasLocale(routing.locales, locale)) {
    return NextResponse.json({ error: "Unsupported locale" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminLocaleCookieName, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

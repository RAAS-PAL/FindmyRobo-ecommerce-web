import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The Payload CMS (/cms, /cms-api) has its own login and no locale prefix:
  // pass it straight through — no next-intl, no Supabase session work.
  if (pathname.startsWith("/cms")) {
    // Until the CMS database is configured, say so instead of a bare 500.
    if (!process.env.DATABASE_URL) {
      return new NextResponse(
        "The CMS is not set up yet: add DATABASE_URL and PAYLOAD_SECRET (see .env.example), then redeploy.",
        { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } }
      );
    }
    return NextResponse.next();
  }

  // Admin panel, API, and auth-callback routes are not locale-prefixed —
  // skip next-intl, but still refresh the Supabase session so auth cookies
  // stay valid.
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth")
  ) {
    return updateSession(request, NextResponse.next({ request }));
  }

  // Storefront: run locale routing first, then layer session refresh onto
  // whatever response (rewrite/redirect/next) next-intl produced.
  const response = intlMiddleware(request);
  return updateSession(request, response);
}

export const config = {
  // Run on everything except Next internals and static files. Supabase needs
  // to see /admin and /api too, so those are no longer excluded here.
  matcher: "/((?!_next|_vercel|.*\\..*).*)",
};

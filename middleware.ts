import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip Next.js internals, static files, API routes, and the admin panel
  // (admin is English-only and must not be locale-prefixed)
  matcher: "/((?!api|admin|_next|_vercel|.*\\..*).*)",
};

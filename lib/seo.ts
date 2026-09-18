import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/siteUrl";

/**
 * Per-page SEO helpers, shared by page metadata and the sitemap so the two
 * can never disagree about what a page's URL is.
 *
 * WHY THIS EXISTS — the canonical bug. The locale layout used to set
 * `alternates.canonical` for every route beneath it, but a layout only knows
 * the locale, not the page, so it emitted "/" or "/en" on every single page.
 * That told Google each product page was a duplicate of the homepage. Pages
 * must declare their own canonical; a page that forgets now gets none (Google
 * falls back to the URL itself — harmless) instead of a wrong one (harmful).
 */

/**
 * Absolute URL for a page in a given locale. Honours localePrefix
 * "as-needed": the default locale (Thai) has no prefix, others do.
 *
 *   localizedUrl("th", "/about") -> https://www.findmyrobo.com/about
 *   localizedUrl("en", "/about") -> https://www.findmyrobo.com/en/about
 *   localizedUrl("th", "/")      -> https://www.findmyrobo.com/
 */
export function localizedUrl(locale: string, path: string): string {
  const clean = path === "/" ? "" : path;
  return locale === routing.defaultLocale
    ? `${siteUrl}${clean || "/"}`
    : `${siteUrl}/${locale}${clean}`;
}

/**
 * canonical + hreflang for one page. `path` is the locale-less route, e.g.
 * "/products/luba-3-awd-5000" — never a query string, never a locale prefix.
 *
 * x-default points at the default locale: the site sends every unmatched
 * visitor to Thai (localeDetection is off), so the search engine should too.
 */
export function pageAlternates(
  locale: string,
  path: string
): NonNullable<Metadata["alternates"]> {
  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, localizedUrl(l, path)])
  );
  return {
    canonical: localizedUrl(locale, path),
    languages: {
      ...languages,
      "x-default": localizedUrl(routing.defaultLocale, path),
    },
  };
}

import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { CONTENT_SECTIONS, DEFAULT_CONTENT, type SiteContent } from "@/data/siteContent";
import { sectionFromPayload } from "@/lib/payloadContent";

/**
 * The storefront's read path for CMS content: the published version of each
 * Payload global (payload.config.ts), mapped to the shapes in
 * data/siteContent.ts. Editing happens at /cms; nothing here writes.
 */

let warnedUnconfigured = false;

/**
 * Everything the storefront renders from the CMS. Cached per request, so the
 * layout, the page and generateMetadata share one set of queries.
 *
 * Without DATABASE_URL the CMS is not set up, and the site shows the built-in
 * defaults — exactly what it showed before there was a CMS. With it, a real
 * database error is thrown rather than papered over: when a page regenerates
 * after a publish, a thrown error keeps the previous good page, whereas
 * defaults would silently roll the live site back to old copy.
 */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  if (!process.env.DATABASE_URL) {
    if (!warnedUnconfigured) {
      warnedUnconfigured = true;
      console.warn("DATABASE_URL not set — CMS disabled, showing built-in content.");
    }
    return DEFAULT_CONTENT;
  }

  const payload = await getPayload({ config });
  const docs = await Promise.all(
    // depth 1 turns media ids into { url, … }; draft: false = published only.
    CONTENT_SECTIONS.map((slug) => payload.findGlobal({ slug, depth: 1, draft: false }))
  );
  return Object.fromEntries(
    CONTENT_SECTIONS.map((section, i) => [section, sectionFromPayload(section, docs[i])])
  ) as unknown as SiteContent;
});

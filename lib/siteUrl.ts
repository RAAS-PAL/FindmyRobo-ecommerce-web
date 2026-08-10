/**
 * Canonical public origin, used for metadataBase, the sitemap, robots.txt, and
 * the payment return URLs.
 *
 * Must match the primary domain exactly, including `www` — the root 308s to
 * www, and Supabase matches redirect URLs literally, so a mismatch here breaks
 * auth links rather than just looking untidy.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.findmyrobo.com"
).replace(/\/$/, "");

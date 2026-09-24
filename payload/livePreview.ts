import type { PayloadRequest } from "payload";
import { PREVIEW_PARAM } from "@/lib/cmsPreview";
import { siteUrl } from "@/lib/siteUrl";

/**
 * Where a global's Live Preview frames the storefront. The page is the real
 * one; `?cms-preview` switches on the listener in SiteContentProvider, which
 * swaps in the unsaved form data Payload posts to the frame.
 *
 * The origin comes from the request, so a preview opened on localhost or on a
 * Vercel preview deployment frames that same deployment — not production.
 */
function originOf(req: PayloadRequest | undefined): string {
  const host = req?.headers?.get("x-forwarded-host") ?? req?.headers?.get("host");
  if (!host) return siteUrl;
  const proto =
    req?.headers?.get("x-forwarded-proto") ?? (/^(localhost|127\.0\.0\.1)(:|$)/.test(host) ? "http" : "https");
  return `${proto}://${host}`;
}

export const previewUrl =
  (path: string) =>
  ({ req }: { req: PayloadRequest }) =>
    `${originOf(req)}${path}?${PREVIEW_PARAM}=1`;

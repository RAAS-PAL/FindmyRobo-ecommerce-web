/**
 * Website media — product photos, renders and videos — lives in the S3 bucket
 * `findmyrobo-media` (Singapore), served through CloudFront. The bucket is
 * private; only the CloudFront distribution can read it.
 *
 * Keys mirror the shared media folder: `<Brand>/<Product>/<file>`, e.g.
 * `Mammotion/Luba3/0804_le3wbx.mp4`. S3 serves files exactly as uploaded, so
 * compress before uploading: a `-web` file next to an original is the smaller
 * copy the site actually shows.
 *
 * NEXT_PUBLIC_MEDIA_BASE_URL moves every media link to another address without
 * a code change: the links built here, and the ones saved in product records
 * and the CMS (rebaseMedia). On Vercel, redeploy after changing it — NEXT_PUBLIC_
 * values are fixed when the site is built. Unset, the CloudFront address is used.
 */

/** The address media links are saved with in product records and the CMS. */
const SAVED_MEDIA_BASE_URL = "https://d5hk9n8my7l32.cloudfront.net";

export const mediaBaseUrl = (
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.trim() || SAVED_MEDIA_BASE_URL
).replace(/\/$/, "");

/** Full URL for a bucket key; folder names with spaces are encoded. */
export const media = (key: string) =>
  `${mediaBaseUrl}/${key.split("/").map(encodeURIComponent).join("/")}`;

/**
 * Swaps the saved CloudFront address for NEXT_PUBLIC_MEDIA_BASE_URL in every
 * string of a product record or CMS document, so links saved in the database
 * follow the setting too. Returns the value untouched when nothing is set.
 */
export function rebaseMedia<T>(value: T): T {
  if (mediaBaseUrl === SAVED_MEDIA_BASE_URL) return value;
  const from = `${SAVED_MEDIA_BASE_URL}/`;
  const to = `${mediaBaseUrl}/`;
  const walk = (v: unknown): unknown => {
    if (typeof v === "string") return v.includes(from) ? v.split(from).join(to) : v;
    if (Array.isArray(v)) return v.map(walk);
    if (v !== null && typeof v === "object") {
      const proto = Object.getPrototypeOf(v);
      if (proto === Object.prototype || proto === null) {
        return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
      }
    }
    return v;
  };
  return walk(value) as T;
}

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
 * Set NEXT_PUBLIC_MEDIA_BASE_URL only to move the media host (e.g. to a custom
 * domain); the CloudFront address is the default.
 */
export const mediaBaseUrl = (
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "https://d5hk9n8my7l32.cloudfront.net"
).replace(/\/$/, "");

/** Full URL for a bucket key; folder names with spaces are encoded. */
export const media = (key: string) =>
  `${mediaBaseUrl}/${key.split("/").map(encodeURIComponent).join("/")}`;

/**
 * Payload Live Preview (the side-by-side preview in /cms).
 *
 * The CMS frames the real storefront page with `?cms-preview` in the URL
 * (payload/livePreview.ts) and posts the unsaved form data into the frame as
 * the editor types. SiteContentProvider listens for it and swaps the draft in
 * on the client. Nothing is saved, and nothing reaches other visitors.
 *
 * The listener only runs inside a frame, only when this parameter asked for
 * it, and only accepts messages from its own origin — so another site framing
 * findmyrobo.com cannot feed it fake content.
 */
export const PREVIEW_PARAM = "cms-preview";

/** Remembered for the frame's session, so the preview survives in-frame navigation. */
export const PREVIEW_SESSION_KEY = "findmyrobo:cms-preview";

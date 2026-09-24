/**
 * The live preview beside Admin → Content editors.
 *
 * The editor frames the real storefront page with `?cms-preview` in the URL
 * and posts its unpublished draft into the frame; the storefront's
 * SiteContentProvider swaps the draft in on the client. Nothing is saved and
 * nothing reaches the server — closing the editor discards it.
 *
 * Both sides only talk to their own origin: the frame accepts messages only
 * from a same-origin parent window, and the editor only posts to its own
 * origin. So another site framing findmyrobo.com cannot feed it fake content.
 */

/** Query parameter that switches the preview listener on inside the frame. */
export const PREVIEW_PARAM = "cms-preview";

/** Frame → editor: listener is attached; send the current draft. */
export const PREVIEW_READY = "findmyrobo:preview-ready";
/** Editor → frame: replace one section with this draft. */
export const PREVIEW_CONTENT = "findmyrobo:preview-content";
/** Editor → frame: scroll the element marked data-cms="<target>" into view. */
export const PREVIEW_SCROLL = "findmyrobo:preview-scroll";

/**
 * data-cms markers on storefront sections, so the editor can scroll the
 * preview to whatever panel is being edited.
 */
export type PreviewTarget =
  | "announcement"
  | "hero"
  | "showcase"
  | "gallery"
  | "trust"
  | "footer"
  | "about-intro"
  | "about-stats"
  | "about-story"
  | "about-partner"
  | "about-values"
  | "about-milestones"
  | "about-team"
  | "contact-main"
  | "contact-line";

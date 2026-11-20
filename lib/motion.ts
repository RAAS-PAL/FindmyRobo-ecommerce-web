/**
 * The storefront's motion values (2026-11-19 redesign). Framer Motion takes
 * these; CSS uses the matching --ease-* tokens in globals.css.
 *
 * What may move: a button pressed (scale 0.97), colour on hover, the hero
 * cross-fading on a tab, menus and popovers from their trigger, the quote
 * drawer and phone menu along their edge, an FAQ row opening, the gallery
 * swipe. Nothing else animates: no scroll entrances, no hover lifts or
 * zooms, no count-ups, no loops.
 */

/** Strong ease-out: starts fast, so a response is visible at once. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
/** iOS-like drawer curve. */
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

/** A cross-fade (opacity only), e.g. the hero when a tab is pressed. */
export const FADE = { duration: 0.3, ease: EASE_OUT };
/** Menus and popovers opening from their trigger. */
export const PANEL_IN = { duration: 0.22, ease: EASE_OUT };
/** …and closing, a little faster than they open. */
export const PANEL_OUT = { duration: 0.16, ease: EASE_OUT };
/** The quote drawer and the phone menu, in and out along the same edge. */
export const DRAWER = { duration: 0.32, ease: EASE_DRAWER };

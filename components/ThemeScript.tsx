"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { THEME_SCRIPT, applyStoredTheme } from "@/lib/theme";

const noSubscribe = () => () => {};

/**
 * THEME_SCRIPT as a tag, for the root layout: sets the theme before first
 * paint. It is only rendered in the server HTML (and matched while
 * hydrating). Switching language swaps the whole [locale] layout in the
 * browser: a <script> React creates there never runs (and React warns about
 * it), and the rebuilt <html> has lost its data-theme — so on such a mount
 * the theme is put back before paint instead.
 */
export default function ThemeScript() {
  // true on the server and while hydrating; false for a mount in the browser
  const fromServer = useSyncExternalStore(noSubscribe, () => false, () => true);

  useLayoutEffect(() => {
    applyStoredTheme();
  }, []);

  return fromServer ? <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} /> : null;
}

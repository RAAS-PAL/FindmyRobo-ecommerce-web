"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

export const THEME_KEY = "raaspal-theme";
const THEME_EVENT = "raaspal-theme-change";

/**
 * Runs before first paint (injected into <head>) so the correct theme is on
 * <html> before React hydrates — otherwise a dark-mode visitor sees a white
 * flash. Kept as a string because it must be inline, not a module.
 * Defaults to LIGHT: the light green look is the brand default (CEO decision),
 * so dark mode is opt-in rather than following the OS.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="dark")document.documentElement.classList.add("dark");}catch(e){}})();`;

/* The <html> class is the source of truth (the init script owns it before React
   exists), so the theme is read as external state rather than mirrored into
   React state — no effect, no cascading render, no hydration mismatch. */
const subscribe = (onChange: () => void) => {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
};
const getSnapshot = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";
const getServerSnapshot = (): Theme => "light";

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const next: Theme = getSnapshot() === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      // storage unavailable (private mode) — theme still applies for this visit
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  return { theme, toggle };
}

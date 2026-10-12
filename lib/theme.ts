/**
 * Light / dark theme. The theme is the `data-theme` attribute on <html>;
 * globals.css keys its dark token set to it. A visitor's choice is kept in
 * localStorage; with none, the OS setting applies (and follows it live).
 */
export type Theme = "light" | "dark";

const KEY = "fmr-theme";

/** What the page is showing now (browser only). */
export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/** Switch the page and remember the choice. */
export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // private mode or storage blocked: the switch still works for this page
  }
}

/** Tells a component when the attribute changes (for useSyncExternalStore). */
export function subscribeTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

/** Re-apply the stored choice, else the OS (a browser-side remount of <html>). */
export function applyStoredTheme() {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(KEY);
  } catch {
    // storage blocked: fall back to the OS
  }
  document.documentElement.dataset.theme =
    stored === "dark" || stored === "light"
      ? stored
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

/**
 * Inline script for the top of <body> (components/ThemeScript.tsx): sets the theme before the first paint
 * (no flash of the wrong one), from the stored choice or else the OS, and
 * keeps following the OS while there is no stored choice.
 */
export const THEME_SCRIPT = `(function(){try{var k="${KEY}",s=localStorage.getItem(k),m=window.matchMedia("(prefers-color-scheme: dark)"),d=document.documentElement;d.dataset.theme=s==="dark"||s==="light"?s:m.matches?"dark":"light";m.addEventListener("change",function(e){try{if(!localStorage.getItem(k))d.dataset.theme=e.matches?"dark":"light"}catch(x){}})}catch(e){}})();`;

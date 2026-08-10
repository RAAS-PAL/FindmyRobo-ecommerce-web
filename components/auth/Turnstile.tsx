"use client";

import { useEffect, useRef } from "react";

/**
 * Cloudflare Turnstile widget for the signup form.
 *
 * Renders nothing when NEXT_PUBLIC_TURNSTILE_SITE_KEY is unset, and the form
 * treats the token as optional in that case — so signup keeps working before
 * the keys are configured, matching how Omise and Resend degrade here.
 *
 * The matching SECRET key goes in the Supabase dashboard under
 * Authentication → Attack Protection → Enable Captcha protection (Turnstile).
 * Supabase verifies the token server-side; a widget alone stops nothing.
 */

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render: (
    el: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    }
  ) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
export const captchaEnabled = Boolean(turnstileSiteKey);

/** Loads the script once per page, shared by any widget that mounts. */
let scriptPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("turnstile")));
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("turnstile"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export default function Turnstile({
  onToken,
}: {
  /** Called with the token, or null when it expires or fails. */
  onToken: (token: string | null) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  // Kept in a ref so re-renders from the parent form don't re-run the effect
  // and mount a second widget.
  const callback = useRef(onToken);
  callback.current = onToken;

  useEffect(() => {
    if (!captchaEnabled) return;
    let widgetId: string | null = null;
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !container.current || !window.turnstile) return;
        widgetId = window.turnstile.render(container.current, {
          sitekey: turnstileSiteKey,
          theme: "auto",
          callback: (token) => callback.current(token),
          "expired-callback": () => callback.current(null),
          "error-callback": () => callback.current(null),
        });
      })
      .catch(() => {
        // Script blocked (ad blocker, network). Leave the token null; the form
        // surfaces this rather than letting the user submit into a failure.
        if (!cancelled) callback.current(null);
      });

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, []);

  if (!captchaEnabled) return null;
  return <div ref={container} className="flex justify-center" />;
}

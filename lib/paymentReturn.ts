import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Absolute URL the bank/wallet sends the customer back to after a redirect
 * payment (3-D Secure, PromptPay, wallets).
 *
 * Must be built through next-intl's `getPathname` rather than hardcoded: the
 * app uses `localePrefix: "as-needed"` with Thai as the default, so the correct
 * path is `/checkout/return` for Thai but `/en/checkout/return` for English.
 * Hardcoding either one drops the customer into the wrong language mid-payment.
 *
 * `NEXT_PUBLIC_SITE_URL` wins when set (needed so the URL Omise redirects to is
 * the public domain, not an internal Vercel preview host); otherwise the
 * request's own origin is used.
 */
export function paymentReturnUrl(
  request: Request,
  orderId: string,
  locale?: string
): string {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const safeLocale = routing.locales.includes(locale as never)
    ? (locale as (typeof routing.locales)[number])
    : routing.defaultLocale;
  const pathname = getPathname({ href: "/checkout/return", locale: safeLocale });
  return `${origin.replace(/\/$/, "")}${pathname}?order=${encodeURIComponent(orderId)}`;
}

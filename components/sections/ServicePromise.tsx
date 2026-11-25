"use client";

import { useTranslations } from "next-intl";
import { useQuote } from "@/components/quote/QuoteProvider";
import Button from "@/components/ui/Button";

/**
 * The homepage's closing section: who the company is (the heading and a line
 * on the left, a real photo running to the edge of the screen on the right,
 * not in a rounded box), then the two ways to act, so the page doesn't just
 * stop at the footer. Heading, line and photo come from the CMS, already in
 * the page's language.
 *
 * The About page's facts row and promise list used to repeat here (until
 * 2026-11-25): three of the four promises are already under the hero, and
 * the figures are unverified. They stay on /about.
 */
export default function ServicePromise({
  heading,
  body,
  photo,
  photoAlt,
}: {
  heading: string;
  body: string;
  photo?: string | null;
  photoAlt: string;
}) {
  const t = useTranslations("showcase");
  const { openQuote } = useQuote();
  return (
    <section id="support" className="bg-cloud">
      <div className="grid lg:grid-cols-2">
        <div className="px-4 py-16 sm:px-6 lg:py-28 lg:pr-16 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]">
          <h2 className="max-w-xl font-display text-title text-content">{heading}</h2>
          <p className="mt-6 max-w-xl text-lead text-ink-muted">{body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => openQuote()}>
              {t("getQuote")}
            </Button>
            <Button href="/products/request-a-demo" size="lg" variant="secondary">
              {t("bookDemo")}
            </Button>
          </div>
        </div>
        {photo && (
          <div className="relative min-h-[22rem] lg:min-h-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- a CMS URL on any host */}
            <img src={photo} alt={photoAlt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          </div>
        )}
      </div>
    </section>
  );
}

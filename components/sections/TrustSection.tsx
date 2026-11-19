"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSiteContent } from "@/components/SiteContentProvider";
import { pick } from "@/data/siteContent";

export default function TrustSection() {
  const t = useTranslations("trust");
  const locale = useLocale();
  // Heading, text and stats are edited in Admin → Content → Homepage.
  // "Robots deployed" also appears on the About page; keep the two in step.
  const { home } = useSiteContent();
  const stats = home.trustStats.map((stat) => ({ ...stat, label: pick(stat.label, locale) }));
  return (
    <section id="about" className="bg-cloud py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
        {/* copy */}
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-600">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-content sm:text-5xl">
            {pick(home.trustHeading, locale)}
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-muted sm:text-lg">
            {pick(home.trustBody, locale)}
          </p>
          <div className="mt-8 h-1 w-24 rounded-full bg-accent" aria-hidden="true" />
        </div>

        {/* stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
          {stats.map((stat, i) => (
            <div
              key={`${stat.label}-${i}`}
              className="rounded-2xl bg-forest p-6 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.4)] sm:p-8"
            >
              {/* the number as it is, in the HTML from the server: no count-up */}
              <p className="font-mono text-3xl font-semibold tabular-nums text-accent-300 sm:text-4xl">
                {stat.value.toLocaleString("en-US", {
                  minimumFractionDigits: stat.decimals,
                  maximumFractionDigits: stat.decimals,
                })}
                {stat.suffix}
              </p>
              <p className="mt-2 text-sm font-medium text-white/75">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

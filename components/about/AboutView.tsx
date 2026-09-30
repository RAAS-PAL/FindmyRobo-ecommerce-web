"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  ArrowUpRight,
  BadgeCheck,
  Headset,
  Home,
  MapPin,
  Shield,
  Wrench,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import FadeIn from "@/components/ui/FadeIn";
import { useLiveSection } from "@/components/SiteContentProvider";
import { salesMapUrl, siteConfig } from "@/data/siteConfig";
import { pick, type AboutContent } from "@/data/siteContent";

const ICONS = {
  shield: Shield,
  home: Home,
  wrench: Wrench,
  headset: Headset,
} as const;

/**
 * The /about page body. Everything company-specific is edited in Admin →
 * Content → About; headings and buttons stay in messages/*.json.
 *
 * A client component so the editor's live preview can swap in a draft — the
 * page loads the published content on the server and passes it in.
 */
export default function AboutView({ published }: { published: AboutContent }) {
  const t = useTranslations("about");
  const locale = useLocale();
  const about = useLiveSection("about", published);
  const text = (value: { en: string; th: string }) => pick(value, locale);
  // Paragraphs of the other language stand in if this one has none yet.
  const own = locale === "th" ? about.storyBody.th : about.storyBody.en;
  const story = own.filter(Boolean).length
    ? own
    : about.storyBody.en.length
      ? about.storyBody.en
      : about.storyBody.th;
  const { addressLines } = siteConfig.salesContact;

  return (
    <main className="flex-1 bg-cloud">
      {/* hero */}
      <section className="bg-forest-950 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <FadeIn>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-300">
              {t("eyebrow")}
            </p>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              {t("heading")}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/70">
              {text(about.intro)}
            </p>
          </FadeIn>
        </div>
      </section>

      {/* stats */}
      {about.stats.length > 0 && (
        <section className="border-b border-forest-100 bg-surface">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4">
            {about.stats.map((stat) => (
              <FadeIn key={`${stat.label.en}-${stat.value}`}>
                <div className="text-center">
                  <p className="font-mono text-2xl font-extrabold text-content sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[12.5px] leading-snug text-ink-muted">
                    {text(stat.label)}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      {/* story */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <FadeIn>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-600">
              {t("storyEyebrow")}
            </p>
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-content sm:text-4xl">
              {t("storyHeading")}
            </h2>
            <div className="mt-5 space-y-4">
              {story.filter((p) => p.trim()).map((paragraph, index) => (
                <p key={index} className="text-[15px] leading-relaxed text-ink-muted">
                  {paragraph}
                </p>
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-forest-950">
              {/* Plain <img>, as in ProductVisual: this URL is typed or
                  uploaded in the admin panel and can be on any host, which
                  next/image rejects unless it is listed in next.config.ts. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={about.storyImage}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* partner block — switched on and off in Admin → Content → About */}
      {about.partnerEnabled && about.partnerName && (
        <section className="bg-surface py-14 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <FadeIn>
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-1.5">
                <BadgeCheck className="h-4 w-4 text-accent-600" aria-hidden="true" />
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-600">
                  {text(about.partnerEyebrow)}
                </span>
              </span>
              {about.partnerLogo && (
                // Plain <img>: a logo can come from any host an editor pastes,
                // and next/image only serves the domains in next.config.ts.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={about.partnerLogo}
                  alt=""
                  className="mx-auto mt-6 h-12 w-auto max-w-[220px] object-contain"
                />
              )}
              <h2 className="mt-5 font-display text-2xl font-extrabold text-content sm:text-3xl">
                {about.partnerName}
              </h2>
              {text(about.partnerStatus) && (
                <p className="mt-2 text-[15px] font-semibold text-accent-600">
                  {text(about.partnerStatus)}
                </p>
              )}
              <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
                {text(about.partnerBody)}
              </p>
            </FadeIn>
          </div>
        </section>
      )}

      {/* values */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <FadeIn>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-600">
            {t("valuesEyebrow")}
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-2xl font-extrabold tracking-tight text-content sm:text-4xl">
            {t("valuesHeading")}
          </h2>
        </FadeIn>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {about.values.map((value, index) => {
            const Icon = ICONS[value.icon];
            return (
              <FadeIn key={`${value.title.en}-${index}`} delay={index * 0.05}>
                <div className="h-full rounded-2xl border border-forest-100 bg-surface p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-950 text-accent-300">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-content">
                    {text(value.title)}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">
                    {text(value.body)}
                  </p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* milestones */}
      {about.milestones.length > 0 && (
        <section className="bg-surface py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <FadeIn>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-600">
                {t("milestonesEyebrow")}
              </p>
              <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-content sm:text-4xl">
                {t("milestonesHeading")}
              </h2>
            </FadeIn>
            <ol className="mt-10 space-y-0">
              {about.milestones.map((milestone, index) => (
                <FadeIn key={`${milestone.when}-${index}`} delay={index * 0.05}>
                  <li className="relative border-l-2 border-forest-100 pb-8 pl-8 last:border-transparent last:pb-0">
                    <span className="absolute -left-[9px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-accent bg-surface" />
                    <p className="font-mono text-sm font-bold text-accent-600">
                      {milestone.when}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-bold text-content">
                      {text(milestone.title)}
                    </h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-ink-muted">
                      {text(milestone.body)}
                    </p>
                  </li>
                </FadeIn>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* team */}
      {about.team.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <FadeIn>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-600">
              {t("teamEyebrow")}
            </p>
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-content sm:text-4xl">
              {t("teamHeading")}
            </h2>
          </FadeIn>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {about.team.map((member, index) => (
              <FadeIn key={member.name + index} delay={index * 0.05}>
                <div className="rounded-2xl border border-forest-100 bg-surface p-6 text-center">
                  <span className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-forest-950">
                    {member.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.photo}
                        alt={member.name}
                        width={80}
                        height={80}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="font-display text-2xl font-extrabold text-accent-300">
                        {member.name.trim().charAt(0).toUpperCase()}
                      </span>
                    )}
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold text-content">
                    {member.name}
                  </h3>
                  <p className="mt-0.5 text-[13px] text-ink-muted">{text(member.role)}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      {/* visit + CTA */}
      <section className="bg-forest-950 py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <FadeIn>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-300">
              {t("visitEyebrow")}
            </p>
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {t("visitHeading")}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/60">
              {t("visitBody")}
            </p>
            <a
              href={salesMapUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-start gap-3 text-[14px] leading-relaxed text-white/80 transition-colors hover:text-accent-300"
            >
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent-300" aria-hidden="true" />
              <address className="not-italic">
                {addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
                <span className="mt-1 block font-semibold text-accent-300">{t("viewMap")}</span>
              </address>
            </a>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-white">
                {t("ctaHeading")}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-white/60">
                {t("ctaBody")}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/products/request-a-demo"
                  className="flex min-h-[50px] flex-1 items-center justify-center gap-2 rounded-full bg-accent px-6 text-[14px] font-bold text-on-accent transition-all duration-300 hover:shadow-[0_0_28px_-4px_rgb(var(--accent-rgb)/0.65)]"
                >
                  {t("ctaDemo")}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/contact-sales"
                  className="flex min-h-[50px] flex-1 items-center justify-center rounded-full border border-white/20 px-6 text-[14px] font-bold text-white transition-colors hover:border-accent hover:text-accent-300"
                >
                  {t("ctaSales")}
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}

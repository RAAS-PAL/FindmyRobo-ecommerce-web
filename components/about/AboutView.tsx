"use client";

import { useLocale, useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import { useLiveSection } from "@/components/SiteContentProvider";
import { salesMapUrl, siteConfig } from "@/data/siteConfig";
import { pick, type AboutContent } from "@/data/siteContent";
import PageHeader from "@/components/ui/PageHeader";
import SectionHeader from "@/components/ui/SectionHeader";
import FactsRow from "@/components/ui/FactsRow";
import PromiseList from "@/components/ui/PromiseList";
import MetaLine from "@/components/ui/MetaLine";
import Button from "@/components/ui/Button";

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

  const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

  // Light page header, the same facts and promises as the homepage, the story
  // beside its photo, then milestones, team and how to visit. Left-aligned.
  return (
    <main className="flex-1 bg-surface">
      <PageHeader title={t("heading")} lead={text(about.intro)} />

      {about.stats.length > 0 && (
        <div className={container}>
          <FactsRow facts={about.stats.map((stat) => ({ value: stat.value, label: text(stat.label) }))} />
        </div>
      )}

      {/* story — the navbar's "Our story" links here */}
      <section id="story" className="scroll-mt-24 py-16 sm:py-24">
        <div className={`${container} grid items-center gap-10 lg:grid-cols-2 lg:gap-16`}>
          <div>
            <h2 className="font-display text-title text-content">{t("storyHeading")}</h2>
            <div className="mt-5 max-w-xl space-y-4">
              {story
                .filter((p) => p.trim())
                .map((paragraph, index) => (
                  <p key={index} className="text-body text-ink-muted">
                    {paragraph}
                  </p>
                ))}
            </div>
          </div>
          {about.storyImage && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-forest-100">
              {/* Plain <img>: typed or uploaded in the admin panel, any host. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={about.storyImage} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          )}
        </div>
      </section>

      {/* partner block — switched on and off in Admin → Content → About */}
      {about.partnerEnabled && about.partnerName && (
        <section id="partner" className="scroll-mt-24 bg-cloud py-16 sm:py-24">
          <div className={container}>
            <div className="max-w-2xl">
              {text(about.partnerEyebrow) && <MetaLine>{text(about.partnerEyebrow)}</MetaLine>}
              {about.partnerLogo && (
                // Plain <img>: a logo can come from any host an editor pastes.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={about.partnerLogo} alt="" className="mt-4 h-12 w-auto max-w-[220px] object-contain" />
              )}
              <h2 className="mt-4 font-display text-title text-content">{about.partnerName}</h2>
              {text(about.partnerStatus) && (
                <p className="mt-2 text-body font-semibold text-content">{text(about.partnerStatus)}</p>
              )}
              <p className="mt-4 text-body text-ink-muted">{text(about.partnerBody)}</p>
            </div>
          </div>
        </section>
      )}

      {/* what you get — the same four promises as the homepage */}
      <section className="py-16 sm:py-24">
        <div className={container}>
          <SectionHeader title={t("valuesHeading")} />
          <PromiseList
            className="mt-8"
            items={about.values.map((value) => ({ title: text(value.title), body: text(value.body) }))}
          />
        </div>
      </section>

      {about.milestones.length > 0 && (
        <section className="bg-cloud py-16 sm:py-24">
          <div className={container}>
            <SectionHeader title={t("milestonesHeading")} />
            <ol className="mt-8 max-w-3xl border-b border-forest-100">
              {about.milestones.map((milestone, index) => (
                <li
                  key={`${milestone.when}-${index}`}
                  className="grid gap-1 border-t border-forest-100 py-5 sm:grid-cols-[8rem_1fr] sm:gap-6"
                >
                  <p className="text-small font-semibold text-content tabular-nums">{milestone.when}</p>
                  <div>
                    <h3 className="text-body font-semibold text-content">{text(milestone.title)}</h3>
                    <p className="mt-1 text-small text-ink-muted">{text(milestone.body)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {about.team.length > 0 && (
        <section className="py-16 sm:py-24">
          <div className={container}>
            <SectionHeader title={t("teamHeading")} />
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {about.team.map((member, index) => (
                <li key={member.name + index} className="flex items-center gap-4">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cloud">
                    {member.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element -- admin photo, any host
                      <img src={member.photo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-display text-heading text-content">
                        {member.name.trim().charAt(0).toUpperCase()}
                      </span>
                    )}
                  </span>
                  <div>
                    <h3 className="text-body font-semibold text-content">{member.name}</h3>
                    <p className="mt-0.5 text-small text-ink-muted">{text(member.role)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* visit, and the two ways to start */}
      <section className="border-t border-forest-100 py-16 sm:py-24">
        <div className={`${container} grid gap-12 lg:grid-cols-2`}>
          <div>
            <h2 className="font-display text-title text-content">{t("visitHeading")}</h2>
            <p className="mt-3 max-w-xl text-body text-ink-muted">{t("visitBody")}</p>
            <a
              href={salesMapUrl}
              target="_blank"
              rel="noreferrer"
              className="group mt-6 inline-flex items-start gap-3 text-small text-content"
            >
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />
              <address className="not-italic">
                {addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
                <span className="mt-1 block font-semibold text-accent-600 underline-offset-4 group-hover:underline">
                  {t("viewMap")}
                </span>
              </address>
            </a>
          </div>
          <div>
            <h2 className="font-display text-heading text-content">{t("ctaHeading")}</h2>
            <p className="mt-3 max-w-xl text-body text-ink-muted">{t("ctaBody")}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/products/request-a-demo" size="lg">
                {t("ctaDemo")}
              </Button>
              <Button href="/contact-sales" size="lg" variant="secondary">
                {t("ctaSales")}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

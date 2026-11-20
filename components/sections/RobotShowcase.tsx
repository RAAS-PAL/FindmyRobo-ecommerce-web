"use client";

import { useLocale, useTranslations } from "next-intl";
import { useQuote } from "@/components/quote/QuoteProvider";
import { pick } from "@/data/siteContent";
import type { RobotFamily } from "@/data/homeShowcase";
import ShowcasePhoto from "@/components/ui/ShowcasePhoto";
import Button from "@/components/ui/Button";
import MetaLine from "@/components/ui/MetaLine";
import SectionHeader from "@/components/ui/SectionHeader";

/**
 * Product-family banners: the photo is the card, with the family's name, one
 * line and two actions set on its top-left (or bottom-left) over a scrim. `size` encodes priority —
 * "wide" spans the page (lawn mowing, Phantas), "half" shares a row (Pudu,
 * T-Chef).
 */
function FamilyCard({ family, size }: { family: RobotFamily; size: "wide" | "half" }) {
  const t = useTranslations("showcase");
  const locale = useLocale();
  const { openQuote } = useQuote();
  const wide = size === "wide";
  const bottom = family.copyAt === "bottom";
  const title = pick(family.title, locale);

  // Phones stack the photo over the copy: the photos are landscape, and at
  // phone width an overlaid title would land on the robot. From sm the copy
  // sits on the photo, at the top or the bottom (copyAt), over a scrim.
  return (
    <article
      className={`relative isolate flex flex-col overflow-hidden rounded-card bg-forest-950 text-white sm:block ${
        wide ? "sm:h-[36rem] lg:h-[min(80svh,46rem)]" : "sm:h-[34rem] lg:h-[38rem]"
      }`}
    >
      <div className="relative -z-10 aspect-[4/3] overflow-hidden sm:absolute sm:inset-0 sm:aspect-auto">
        <div className="absolute inset-0">
          <ShowcasePhoto
            photo={family}
            alt={title}
            sizes={wide ? "100vw" : "(min-width: 1024px) 50vw, 100vw"}
            captionAt={bottom ? "top" : "bottom"}
          />
        </div>
      </div>
      {/* scrim behind the copy only, fading out before the robot */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 -z-10 hidden sm:block ${
          bottom ? "photo-scrim-bottom" : "photo-scrim-top"
        }`}
      />

      <div
        className={`flex flex-col items-start px-6 pt-7 pb-8 text-left sm:absolute sm:inset-x-0 sm:px-10 ${
          bottom ? "sm:bottom-0 sm:pt-0" : "sm:top-0 sm:pb-0"
        } ${
          wide ? (bottom ? "sm:pb-14" : "sm:pt-14") : bottom ? "sm:pb-10" : "sm:pt-10"
        }`}
      >
        <MetaLine onPhoto>{pick(family.eyebrow, locale)}</MetaLine>
        <h2
          className={`mt-2 max-w-2xl font-display text-white ${wide ? "text-display" : "text-title"}`}
        >
          {title}
        </h2>
        <p className="mt-3 max-w-lg text-body text-white/85">{pick(family.tagline, locale)}</p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={() => openQuote({ interest: family.interest, productId: family.productId })}>
            {t("getQuote")}
          </Button>
          {family.href && (
            <Button href={family.href} variant="onPhoto">
              {t("learnMore")}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

/** One full-width family banner (the priority robots). */
export function FamilyBanner({ family }: { family: RobotFamily }) {
  return (
    <section className="bg-surface px-3 pt-3 sm:px-4 sm:pt-4">
      <FamilyCard family={family} size="wide" />
    </section>
  );
}

/** The second-tier families, two to a row from lg. */
export function MoreFamilies({ families }: { families: RobotFamily[] }) {
  const t = useTranslations("showcase");
  return (
    <section className="bg-surface pt-16 pb-3 sm:pt-24 sm:pb-4">
      {/* the heading in the page container, the photos nearly full width */}
      <div className="mx-auto mb-8 max-w-7xl px-4 sm:mb-10 sm:px-6 lg:px-8">
        <SectionHeader title={t("moreHeading")} lead={t("moreSub")} />
      </div>
      {/* two to a row; one alone spans it rather than leaving half empty */}
      <div className={`grid gap-3 px-3 sm:gap-4 sm:px-4 ${families.length > 1 ? "lg:grid-cols-2" : ""}`}>
        {families.map((family) => (
          <FamilyCard key={family.id} family={family} size={families.length > 1 ? "half" : "wide"} />
        ))}
      </div>
    </section>
  );
}

"use client";

import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useQuote } from "@/components/quote/QuoteProvider";
import { pick } from "@/data/siteContent";
import type { RobotFamily } from "@/data/homeShowcase";
import ShowcasePhoto from "@/components/ui/ShowcasePhoto";

/**
 * Product-family banners, DJI-style: the photo is the card, with the name and
 * two actions set at the top over a soft scrim. `size` encodes priority —
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
      className={`group relative isolate flex flex-col overflow-hidden rounded-2xl bg-forest-950 text-white sm:block ${
        wide ? "sm:h-[36rem] lg:h-[min(80svh,46rem)]" : "sm:h-[34rem] lg:h-[38rem]"
      }`}
    >
      <div className="relative -z-10 aspect-[4/3] overflow-hidden sm:absolute sm:inset-0 sm:aspect-auto">
        <div className="absolute inset-0 transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03] motion-reduce:transition-none">
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
          bottom
            ? "bg-[linear-gradient(to_top,rgba(10,10,11,0.78)_0%,rgba(10,10,11,0.4)_32%,rgba(10,10,11,0)_58%)]"
            : "bg-[linear-gradient(to_bottom,rgba(10,10,11,0.72)_0%,rgba(10,10,11,0.35)_32%,rgba(10,10,11,0)_58%)]"
        }`}
      />

      <div
        className={`mx-auto flex flex-col items-center px-5 pt-7 pb-9 text-center sm:absolute sm:inset-x-0 sm:[text-shadow:0_1px_14px_rgba(0,0,0,0.3)] ${
          bottom ? "sm:bottom-0 sm:pt-0" : "sm:top-0 sm:pb-0"
        } ${
          wide
            ? `max-w-2xl ${bottom ? "sm:pb-16" : "sm:pt-16"}`
            : `max-w-md ${bottom ? "sm:pb-12" : "sm:pt-12"}`
        }`}
      >
        <p className="flex items-center gap-2.5 font-mono text-[11.5px] font-semibold tracking-[0.28em] text-white/85 uppercase [&:lang(th)]:tracking-[0.06em]">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
          {pick(family.eyebrow, locale)}
        </p>
        <h2
          className={`mt-2.5 font-display leading-[1.04] font-extrabold tracking-tight ${
            wide ? "text-[40px] sm:text-6xl lg:text-7xl" : "text-[34px] sm:text-5xl"
          }`}
        >
          {title}
        </h2>
        <p className={`mt-3 text-white/85 ${wide ? "text-[15px] sm:text-lg" : "text-[15px]"}`}>
          {pick(family.tagline, locale)}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => openQuote({ interest: family.interest })}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-accent-gradient px-6 text-[14.5px] font-bold"
          >
            {t("getQuote")}
          </button>
          {family.href && (
            <Link
              href={family.href}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/40 px-6 text-[14.5px] font-semibold text-white transition-colors hover:border-white"
            >
              {t("learnMore")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
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
    <section className="bg-surface px-3 pt-16 pb-3 sm:px-4 sm:pt-24 sm:pb-4">
      <div className="mx-auto mb-8 max-w-2xl px-2 text-center sm:mb-10">
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-content sm:text-[2.6rem]">
          {t("moreHeading")}
        </h2>
        <p className="mt-3 text-[15px] text-ink-muted sm:text-base">{t("moreSub")}</p>
      </div>
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        {families.map((family) => (
          <FamilyCard key={family.id} family={family} size="half" />
        ))}
      </div>
    </section>
  );
}

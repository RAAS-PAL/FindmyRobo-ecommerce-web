"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useQuote } from "@/components/quote/QuoteProvider";
import { pick } from "@/data/siteContent";
import type { RobotFamily } from "@/data/homeShowcase";
import Button from "@/components/ui/Button";
import MetaLine from "@/components/ui/MetaLine";
import { useViewLabel } from "@/lib/useViewLabel";

/**
 * One robot family as an edge-to-edge photo: no rounded box and no margin
 * around it. The copy sits on the photo's top-left, over a scrim.
 */
export function FamilyBanner({ family }: { family: RobotFamily }) {
  const t = useTranslations("showcase");
  const viewLabel = useViewLabel();
  const locale = useLocale();
  const { openQuote } = useQuote();
  if (!family.image) return null;
  return (
    <section className="relative isolate h-[80svh] max-h-[48rem] min-h-[30rem] overflow-hidden bg-forest-950 text-white">
      <Image
        src={family.image}
        alt={pick(family.title, locale)}
        fill
        sizes="100vw"
        className="-z-10 object-cover"
        style={{ objectPosition: family.focus ?? "50% 50%" }}
      />
      <div aria-hidden="true" className="photo-scrim-top absolute inset-0 -z-10" />
      <div aria-hidden="true" className="photo-scrim-start absolute inset-0 -z-10" />
      <div className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-20 lg:px-8">
        <MetaLine onPhoto>{pick(family.eyebrow, locale)}</MetaLine>
        <h2 className="mt-2 font-display text-display">{pick(family.title, locale)}</h2>
        <p className="mt-3 max-w-lg text-lead text-white/85">{pick(family.tagline, locale)}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button size="lg" onClick={() => openQuote({ interest: family.interest, productId: family.productId })}>
            {t("getQuote")}
          </Button>
          {family.href && (
            <Button href={family.href} size="lg" variant="onPhoto">
              {viewLabel(family.href)}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * The other families as rows, not boxes. The robots stand on the
 * page, large, on the row's floor line; the copy sits beside them and the
 * sides alternate.
 */
export function FamilyRows({ families }: { families: RobotFamily[] }) {
  const t = useTranslations("showcase");
  const viewLabel = useViewLabel();
  const locale = useLocale();
  const { openQuote } = useQuote();
  return (
    <section className="bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {families.map((family, i) => (
          <div
            key={family.id}
            className="grid items-end gap-8 border-b border-forest-100 pt-16 lg:grid-cols-2 lg:gap-12 lg:pt-24 dark:border-forest-700"
          >
            <div className={`pb-10 lg:pb-24 ${i % 2 === 1 ? "lg:order-2 lg:pl-8" : ""}`}>
              <MetaLine>{pick(family.eyebrow, locale)}</MetaLine>
              {/* section size: display is kept for the page's h1 and the
                  full-photo banner above, which works as a second hero */}
              <h2 className="mt-2 font-display text-title text-content">{pick(family.title, locale)}</h2>
              <p className="mt-4 max-w-md text-lead text-ink-muted">{pick(family.tagline, locale)}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => openQuote({ interest: family.interest, productId: family.productId })}>
                  {t("getQuote")}
                </Button>
                {family.href && (
                  <Button href={family.href} size="lg" variant="secondary">
                    {viewLabel(family.href)}
                  </Button>
                )}
              </div>
            </div>
            {family.cutout && (
              <Image
                src={family.cutout.src}
                alt={pick(family.title, locale)}
                width={family.cutout.width}
                height={family.cutout.height}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className={`h-auto w-full ${family.cutout.width / family.cutout.height < 1.5 ? "mx-auto max-w-md" : ""}`}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

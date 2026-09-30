"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, Calendar, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useQuote } from "@/components/quote/QuoteProvider";
import FadeIn from "@/components/ui/FadeIn";
import { categoryHref } from "@/data/categories";
import { pick } from "@/data/siteContent";
import type { ModelPage } from "@/data/modelPages";

/**
 * A lineup model's product page (data/modelPages.ts), DJI-style: a dark
 * studio hero with the product, its key figures, one full-width photo per
 * feature, the spec table, and a closing quote call. Quote-only, like the
 * rest of the store: every button opens the quote form with the model named.
 */
export default function ModelPageView({ page }: { page: ModelPage }) {
  const t = useTranslations("modelPage");
  const tc = useTranslations("categories");
  const locale = useLocale();
  const { openQuote } = useQuote();
  const quote = () => openQuote({ modelId: page.id });
  const text = (v: { en: string; th: string }) => pick(v, locale);

  return (
    <main>
      {/* ---- hero: the product on the dark studio set ---- */}
      <section className="relative overflow-hidden bg-[#0b0d10] text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(70%_80%_at_68%_45%,#1d2230_0%,#12151c_50%,#0b0d10_100%)]"
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-4 pt-8 pb-14 sm:px-6 lg:min-h-[calc(100svh-69px)] lg:max-h-[56rem] lg:grid-cols-[1fr_1.1fr] lg:gap-10 lg:px-8 lg:py-12">
          <div className="order-2 lg:order-1">
            <nav aria-label={t("breadcrumb")} className="mb-6 flex items-center gap-1.5 text-[12.5px] text-white/60">
              <Link href="/shop" className="hover:text-white">
                {t("shop")}
              </Link>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              <Link href={categoryHref(page.category)} className="hover:text-white">
                {tc(`${page.category}.name`)}
              </Link>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="text-white/85">{page.name}</span>
            </nav>
            <p className="flex items-center gap-2.5 font-mono text-[11.5px] font-semibold tracking-[0.28em] text-white/80 uppercase [&:lang(th)]:tracking-[0.06em]">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              {text(page.eyebrow)}
            </p>
            <h1 className="mt-3 font-display text-5xl leading-[1.02] font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              {page.brand} <span className="text-accent-gradient">{page.name}</span>
            </h1>
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-white/80 sm:text-lg">
              {text(page.tagline)}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={quote}
                className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-accent-gradient px-7 text-[15px] font-bold"
              >
                {t("getQuote")}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <Link
                href="/products/request-a-demo"
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/35 px-6 text-[15px] font-semibold text-white transition-colors hover:border-white"
              >
                <Calendar className="h-4 w-4" aria-hidden="true" />
                {t("bookDemo")}
              </Link>
            </div>
          </div>
          <div className="relative order-1 mx-auto w-full max-w-md lg:order-2 lg:max-w-none">
            <Image
              src={page.heroImage.src}
              alt={`${page.brand} ${page.name}`}
              width={page.heroImage.width}
              height={page.heroImage.height}
              priority
              sizes="(min-width: 1024px) 50vw, 90vw"
              className="h-auto w-full"
            />
          </div>
        </div>

        {/* ---- key figures ---- */}
        <div className="relative border-t border-white/10">
          <dl className="mx-auto grid max-w-7xl grid-cols-2 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
            {page.figures.map((figure, i) => (
              <div
                key={figure.value}
                className={`py-7 lg:py-9 ${i % 2 === 1 ? "pl-5 lg:pl-8" : "lg:pl-8"} ${
                  i > 0 ? "lg:border-l lg:border-white/10" : "lg:pl-0"
                } ${i === 1 ? "border-l border-white/10" : ""} ${i === 3 ? "border-l border-white/10" : ""}`}
              >
                <dt className="order-2 mt-1.5 text-[13px] text-white/60">{text(figure.label)}</dt>
                <dd className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{figure.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---- one photo per feature ---- */}
      {page.features.map((feature) => (
        <section key={feature.image} className="bg-surface pt-20 sm:pt-28">
          <FadeIn className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <p className="font-mono text-[11px] font-semibold tracking-[0.3em] text-accent-600 uppercase [&:lang(th)]:tracking-[0.06em]">
              {text(feature.eyebrow)}
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-content sm:text-5xl">
              {text(feature.title)}
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-muted sm:text-lg">{text(feature.body)}</p>
          </FadeIn>
          <div className="mx-auto mt-10 max-w-7xl px-3 sm:mt-14 sm:px-6 lg:px-8">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-forest-950">
              <Image src={feature.image} alt={feature.alt} fill sizes="(min-width: 1280px) 1216px, 100vw" className="object-cover" />
            </div>
          </div>
        </section>
      ))}

      {/* ---- specifications ---- */}
      <section id="specs" className="bg-surface py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-content sm:text-5xl">
            {t("specsHeading")}
          </h2>
          <div className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {page.specs.map((group) => (
              <div key={group.title.en}>
                <h3 className="border-b-2 border-content pb-2 font-display text-lg font-bold text-content">
                  {text(group.title)}
                </h3>
                <dl>
                  {group.rows.map((row) => (
                    <div
                      key={row.label.en}
                      className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-4 border-b border-forest-100 py-3 text-[14px]"
                    >
                      <dt className="text-ink-muted">{text(row.label)}</dt>
                      <dd className="font-semibold text-content">{text(row.value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- closing call ---- */}
      <section className="bg-[#0b0d10] py-20 text-center text-white sm:py-24">
        <div className="mx-auto max-w-xl px-4">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("ctaHeading", { name: page.name })}
          </h2>
          <p className="mt-4 text-white/75">{t("ctaBody")}</p>
          <button
            type="button"
            onClick={quote}
            className="mt-8 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-accent-gradient px-8 text-[15px] font-bold"
          >
            {t("getQuote")}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </section>
    </main>
  );
}

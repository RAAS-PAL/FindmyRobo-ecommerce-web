import FadeIn from "@/components/ui/FadeIn";
import VideoEmbed from "@/components/product/VideoEmbed";
import ShowcaseCarousel from "@/components/product/ShowcaseCarousel";
import TechAnatomy from "@/components/sections/TechAnatomy";
import type { Locale, PageBlock, RobotVariant } from "@/data/products";

/**
 * Renders the admin-built content sections of a product detail page, in
 * order. Every block type is optional and per-product, so robots with less
 * media simply have fewer/different sections (see data/products.ts PageBlock).
 */

const pick = (t: { en: string; th: string }, locale: Locale) => t[locale] || t.en;

/* eslint-disable @next/next/no-img-element -- admin-entered URLs, any host */
export default function ProductPageBlocks({
  blocks,
  locale,
  productName,
  variant,
}: {
  blocks: PageBlock[];
  locale: Locale;
  productName: string;
  /** Decides which anatomy an "anatomy" block renders, if any. */
  variant: RobotVariant;
}) {
  return (
    <div className="space-y-16 sm:space-y-20">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "anatomy":
            // Full-bleed: the section is a dark band, but blocks render inside
            // the page's max-w container. <main> has overflow-x-clip, so the
            // 100vw break-out can't introduce sideways scroll.
            return (
              <div
                key={i}
                className="relative left-1/2 right-1/2 -mx-[50vw] w-screen"
              >
                <TechAnatomy variant={variant} />
              </div>
            );

          case "banner":
            return (
              <FadeIn key={i}>
                <img
                  src={block.image}
                  alt=""
                  loading="lazy"
                  className="max-h-[560px] w-full rounded-3xl object-cover"
                />
              </FadeIn>
            );

          case "feature":
            return (
              <FadeIn key={i}>
                <section className="mx-auto max-w-3xl text-center">
                  {block.image && (
                    <img
                      src={block.image}
                      alt=""
                      loading="lazy"
                      className="mb-8 max-h-[480px] w-full rounded-3xl object-cover"
                    />
                  )}
                  <h2 className="font-display text-2xl font-extrabold tracking-tight text-content sm:text-3xl">
                    {pick(block.heading, locale)}
                  </h2>
                  <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-ink-muted">
                    {pick(block.body, locale)}
                  </p>
                </section>
              </FadeIn>
            );

          case "cardGrid":
            return (
              <FadeIn key={i}>
                <section>
                  {block.heading && (
                    <h2 className="mb-8 text-center font-display text-2xl font-extrabold tracking-tight text-content sm:text-3xl">
                      {pick(block.heading, locale)}
                    </h2>
                  )}
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {block.cards.map((card, j) => (
                      <figure
                        key={j}
                        className="overflow-hidden rounded-2xl border border-forest-100 bg-surface"
                      >
                        <img
                          src={card.image}
                          alt={pick(card.caption, locale)}
                          loading="lazy"
                          className="aspect-[4/3] w-full object-cover"
                        />
                        <figcaption className="px-5 py-4 text-center text-[13.5px] font-medium leading-snug text-content">
                          {pick(card.caption, locale)}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </section>
              </FadeIn>
            );

          case "showcase":
            return (
              <FadeIn key={i}>
                <ShowcaseCarousel
                  heading={block.heading ? pick(block.heading, locale) : undefined}
                  cards={block.cards}
                  locale={locale}
                />
              </FadeIn>
            );

          case "imageText":
            return (
              <FadeIn key={i}>
                <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                  <img
                    src={block.image}
                    alt=""
                    loading="lazy"
                    className={`w-full rounded-3xl object-cover ${
                      block.imageSide === "left" ? "" : "lg:order-2"
                    }`}
                  />
                  <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-muted">
                    {pick(block.body, locale)}
                  </p>
                </section>
              </FadeIn>
            );

          case "video":
            return (
              <FadeIn key={i}>
                <section>
                  {block.heading && (
                    <h2 className="mb-6 font-display text-2xl font-extrabold tracking-tight text-content sm:text-3xl">
                      {pick(block.heading, locale)}
                    </h2>
                  )}
                  <VideoEmbed
                    url={block.url}
                    title={block.heading ? pick(block.heading, locale) : productName}
                  />
                  {block.caption && (
                    <p className="mt-3 text-center text-[12.5px] text-ink-muted">
                      {pick(block.caption, locale)}
                    </p>
                  )}
                </section>
              </FadeIn>
            );
        }
      })}
    </div>
  );
}

import VideoEmbed from "@/components/product/VideoEmbed";
import ShowcaseCarousel from "@/components/product/ShowcaseCarousel";
import TechAnatomy from "@/components/sections/TechAnatomy";
import MetaLine from "@/components/ui/MetaLine";
import type { Locale, PageBlock } from "@/data/products";

/**
 * Renders the admin-built content sections of a product detail page, in
 * order. Every block type is optional and per-product, so robots with less
 * media simply have fewer/different sections (see data/products.ts PageBlock).
 */

const pick = (t: { en: string; th: string }, locale: Locale) => t[locale] || t.en;

/**
 * Blocks that render as a full-bleed dark band. Two of them in a row are joined
 * rather than spaced — add any future dark-band block type here.
 */
const isDarkBand = (block?: PageBlock) =>
  block?.type === "anatomy" || block?.type === "showcase";

type FeatureBlock = Extract<PageBlock, { type: "feature" }>;
const isTextFeature = (block: PageBlock): block is FeatureBlock =>
  block.type === "feature" && !block.image;

/** Card columns for a feature group, by how many cards it has: never a lone
 *  card on a row of its own. */
const GROUP_COLS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "md:grid-cols-3",
  4: "sm:grid-cols-2",
};

/* eslint-disable @next/next/no-img-element -- admin-entered URLs, any host */
export default function ProductPageBlocks({
  blocks,
  locale,
  productName,
  featureGroupHeading,
}: {
  blocks: PageBlock[];
  locale: Locale;
  productName: string;
  /** Full-screen pages: two or more feature sections in a row without a
   *  photo are shown together as one group of cards under this heading, so
   *  they don't read as a stretch of empty page after the photo sections. */
  featureGroupHeading?: string;
}) {
  // Runs of photo-less feature sections become one group; a lone one keeps
  // its usual form.
  const parts: ({ block: PageBlock } | { group: FeatureBlock[] })[] = [];
  for (const block of blocks) {
    const last = parts.at(-1);
    if (featureGroupHeading && isTextFeature(block)) {
      if (last && "group" in last) last.group.push(block);
      else parts.push({ group: [block] });
    } else {
      parts.push({ block });
    }
  }
  const items = parts.map((part) =>
    "group" in part && part.group.length === 1 ? { block: part.group[0] } : part
  );

  const renderGroup = (group: FeatureBlock[]) => (
    <section>
      <h2 className="font-display text-title text-content">{featureGroupHeading}</h2>
      <div
        className={`mt-10 grid gap-4 sm:mt-12 sm:gap-6 ${
          GROUP_COLS[group.length] ?? "sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {group.map((block, j) => (
          <div key={j} className="h-full">
            <article className="h-full rounded-card bg-cloud p-6">
              {block.eyebrow && <MetaLine>{pick(block.eyebrow, locale)}</MetaLine>}
              <h3 className={`font-display text-heading text-content ${block.eyebrow ? "mt-1" : ""}`}>
                {pick(block.heading, locale)}
              </h3>
              <p className="mt-3 whitespace-pre-line text-body text-ink-muted">{pick(block.body, locale)}</p>
            </article>
          </div>
        ))}
      </div>
    </section>
  );

  const renderBlock = (block: PageBlock, i: number) => {
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
                <TechAnatomy model={block.model} />
              </div>
            );

          case "banner":
            return (
              <div key={i}>
                <img
                  src={block.image}
                  alt=""
                  loading="lazy"
                  className="max-h-[560px] w-full rounded-card object-cover"
                />
              </div>
            );

          case "feature":
            return (
              <div key={i}>
                <section className="max-w-3xl">
                  {block.image && (
                    <img
                      src={block.image}
                      alt=""
                      loading="lazy"
                      className="mb-8 max-h-[480px] w-full rounded-card object-cover"
                    />
                  )}
                  <h2 className="font-display text-title text-content">
                    {pick(block.heading, locale)}
                  </h2>
                  <p className="mt-4 whitespace-pre-line text-body leading-relaxed text-ink-muted">
                    {pick(block.body, locale)}
                  </p>
                </section>
              </div>
            );

          case "cardGrid":
            return (
              <div key={i}>
                <section>
                  {block.heading && (
                    <h2 className="mb-8 font-display text-title text-content">
                      {pick(block.heading, locale)}
                    </h2>
                  )}
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {block.cards.map((card, j) => (
                      <figure
                        key={j}
                        className="overflow-hidden rounded-card bg-cloud"
                      >
                        <img
                          src={card.image}
                          alt={pick(card.caption, locale)}
                          loading="lazy"
                          className="aspect-[4/3] w-full object-cover"
                        />
                        <figcaption className="p-4 text-body font-semibold text-content">
                          {pick(card.caption, locale)}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </section>
              </div>
            );

          case "showcase":
            // Full-bleed dark band. The cards are fixed dark in both themes, so
            // on a light page they read as a floating slab with hard edges —
            // running the background edge to edge makes it deliberate. Same
            // break-out as the anatomy block; <main> has overflow-x-clip.
            return (
              <div
                key={i}
                className="relative left-1/2 right-1/2 -mx-[50vw] w-screen bg-forest-950 py-14 sm:py-20"
              >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div>
                    <ShowcaseCarousel
                      heading={block.heading ? pick(block.heading, locale) : undefined}
                      cards={block.cards}
                      locale={locale}
                    />
                  </div>
                </div>
              </div>
            );

          case "imageText":
            return (
              <div key={i}>
                <section className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                  <img
                    src={block.image}
                    alt=""
                    loading="lazy"
                    className={`w-full rounded-card object-cover ${
                      block.imageSide === "left" ? "" : "lg:order-2"
                    }`}
                  />
                  <p className="whitespace-pre-line text-body leading-relaxed text-ink-muted">
                    {pick(block.body, locale)}
                  </p>
                </section>
              </div>
            );

          case "video":
            return (
              <div key={i}>
                <section>
                  {block.heading && (
                    <h2 className="mb-6 font-display text-title text-content">
                      {pick(block.heading, locale)}
                    </h2>
                  )}
                  <VideoEmbed
                    url={block.url}
                    title={block.heading ? pick(block.heading, locale) : productName}
                  />
                  {block.caption && (
                    <p className="mt-3 text-caption text-ink-muted">
                      {pick(block.caption, locale)}
                    </p>
                  )}
                </section>
              </div>
            );
    }
  };

  return (
    <div>
      {items.map((item, i) => {
        // Spacing lives on a per-block wrapper rather than space-y on the
        // container, so it can be dropped between two full-bleed dark bands.
        // With a gap they read as two separate sections split by a light
        // stripe; without one they run together as a single dark passage.
        const previous = items[i - 1];
        const joinsPrevious =
          "block" in item && isDarkBand(item.block) && !!previous && "block" in previous && isDarkBand(previous.block);
        return (
          <div key={i} className={i === 0 || joinsPrevious ? undefined : "mt-16 sm:mt-20"}>
            {"group" in item ? renderGroup(item.group) : renderBlock(item.block, i)}
          </div>
        );
      })}
    </div>
  );
}

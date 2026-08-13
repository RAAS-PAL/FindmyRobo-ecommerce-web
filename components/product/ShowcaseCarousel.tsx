"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Locale, LocalizedText } from "@/data/products";

/**
 * A horizontal, swipeable set of dark feature cards (image + title + body),
 * rendered from a "showcase" page block. Scrolls left/right via the arrows and
 * native swipe/scroll. Content is admin-editable (see PageBuilder).
 */
export default function ShowcaseCarousel({
  heading,
  cards,
  locale,
}: {
  heading?: string;
  cards: { image: string; title: LocalizedText; body: LocalizedText }[];
  locale: Locale;
}) {
  const tp = useTranslations("products");
  const pick = (t: LocalizedText) => t[locale] || t.en;
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section>
      {/* Fixed light-on-dark rather than theme tokens: this block always sits
          on a dark band (see ProductPageBlocks), so `text-content` would be
          dark-on-dark in light mode. */}
      {heading && (
        <h2 className="mb-8 text-center font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          {heading}
        </h2>
      )}

      <div ref={scroller} className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2">
        {cards.map((card, i) => (
          <article
            key={i}
            className="flex w-[82%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#34363d] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.image}
              alt={pick(card.title)}
              loading="lazy"
              className="aspect-[4/5] w-full bg-[#34363d] object-contain p-3 sm:p-4"
            />
            <div className="p-5 sm:p-6">
              <h3 className="font-display text-lg font-bold text-white">{pick(card.title)}</h3>
              <p className="mt-2.5 whitespace-pre-line text-[13.5px] leading-relaxed text-white/70">
                {pick(card.body)}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* Arrows only when the cards overflow the 3-across desktop row. */}
      {cards.length > 3 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label={tp("scrollLeft")}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-gold hover:bg-white/10 hover:text-gold"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label={tp("scrollRight")}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:border-gold hover:bg-white/10 hover:text-gold"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}

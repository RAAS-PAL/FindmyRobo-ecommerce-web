"use client";

import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { useQuote } from "@/components/quote/QuoteProvider";
import ModelTile from "@/components/ui/ModelTile";
import type { LineupModel } from "@/data/lineup";

/**
 * A model we sell that has no product page yet (data/lineup.ts): its card on
 * the category page. The navbar links here by the card's id, so it scrolls
 * clear of the sticky bar and is outlined when it's the one linked to.
 * "Get a quote" opens the quote form with the model named in it.
 */
export default function LineupCard({ model }: { model: LineupModel }) {
  const t = useTranslations("shop");
  const tn = useTranslations("nav");
  const { openQuote } = useQuote();

  return (
    <article
      id={model.id}
      className="flex w-full max-w-sm scroll-mt-24 flex-col overflow-hidden rounded-2xl border border-forest-100 bg-surface transition-shadow target:border-accent target:shadow-[0_0_0_3px_rgb(var(--accent-rgb)/0.25)]"
    >
      <div className="h-52 bg-gradient-to-b from-cloud to-forest-100/40 p-6">
        <ModelTile
          category={model.category}
          image={model.image}
          sizes="(min-width: 1024px) 25vw, 90vw"
          className="h-full w-full"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <span className="font-mono text-[10px] font-semibold tracking-[0.18em] text-accent-600 uppercase">
          {model.brand}
        </span>
        <h2 className="font-display text-xl leading-snug font-bold text-content">{model.name}</h2>
        <p className="text-[13px] leading-relaxed text-ink-muted">{t("modelPageSoon")}</p>
        <div className="mt-auto pt-4">
          <button
            type="button"
            onClick={() => openQuote({ modelId: model.id })}
            className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full bg-accent-gradient px-6 text-[14px] font-bold"
          >
            {tn("getQuote")}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

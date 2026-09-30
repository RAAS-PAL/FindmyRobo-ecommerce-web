"use client";

import QuoteForm from "@/components/quote/QuoteForm";

/**
 * The hero's quote card. From lg it floats over the dark studio hero, so it
 * wears the dark glass tone (`.hero-quote-dark` in globals.css); on phones it
 * sits on the light page under the copy and keeps the light one.
 */
export default function HeroQuote({
  onOpenChange,
}: {
  /** Told when the card opens or closes (the hero pauses its slides meanwhile). */
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <div className="hero-quote-dark flex flex-col items-center lg:items-end">
      <QuoteForm onExpandedChange={onOpenChange} />
    </div>
  );
}

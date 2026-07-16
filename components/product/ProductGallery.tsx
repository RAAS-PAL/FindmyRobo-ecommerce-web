"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductVisual from "@/components/ui/ProductVisual";
import type { Product } from "@/data/products";

/**
 * Product-page photo gallery. At rest the strip below the photo is a row of
 * dots; pointing at (or tabbing into) the panel swaps them for thumbnails and
 * reveals the arrows — the same reveal Mammotion's product pages use.
 *
 * Devices without hover never get that reveal, so `@media (hover: none)` pins
 * the thumbnails open there instead.
 *
 * Falls back to the plain single visual (photo or variant illustration) when
 * the product has fewer than two photos.
 */
export default function ProductGallery({
  product,
  labels,
}: {
  product: Pick<Product, "name" | "variant" | "imageUrl" | "images">;
  labels: { previous: string; next: string; thumbnail: string };
}) {
  const [index, setIndex] = useState(0);

  const images = [product.imageUrl, ...(product.images ?? [])].filter(
    (url): url is string => !!url
  );

  const panelClass =
    "relative flex min-h-[430px] flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest to-forest-800 p-5 sm:min-h-[520px] sm:p-8";
  const glow = (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[80px]"
      aria-hidden="true"
    />
  );

  if (images.length < 2) {
    return (
      <div className={`${panelClass} items-center justify-center`}>
        {glow}
        <ProductVisual
          product={product}
          className="relative mx-auto h-[360px] max-h-full w-full drop-shadow-[0_24px_40px_rgba(6,31,21,0.7)] sm:h-[440px]"
        />
      </div>
    );
  }

  const go = (next: number) => setIndex((next + images.length) % images.length);
  // hidden at rest, revealed while the panel is hovered or holds focus
  const onReveal =
    "opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100";

  return (
    <div className={`group ${panelClass}`}>
      {glow}

      {/* stage — every photo stays mounted so switching never re-fetches */}
      <div className="relative flex-1">
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={i === 0 ? product.name : `${product.name} — ${i + 1}`}
            aria-hidden={i !== index}
            loading={i === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 h-full w-full object-contain drop-shadow-[0_24px_40px_rgba(6,31,21,0.7)] transition-opacity duration-500 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => go(index - 1)}
        aria-label={labels.previous}
        className={`absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 focus-visible:opacity-100 ${onReveal}`}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        aria-label={labels.next}
        className={`absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 focus-visible:opacity-100 ${onReveal}`}
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* rail: dots and thumbnails share the row, cross-fading on hover */}
      <div className="relative mt-4 h-[68px] shrink-0">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 flex h-full items-end justify-center gap-2 pb-3 transition-opacity duration-300 group-hover:opacity-0 group-focus-within:opacity-0 [@media(hover:none)]:opacity-0"
        >
          {images.map((src, i) => (
            <span
              key={src}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-5 bg-gold" : "w-1.5 bg-white/35"
              }`}
            />
          ))}
        </div>

        <div
          className={`absolute inset-x-0 bottom-0 flex h-full items-end justify-center gap-2.5 overflow-x-auto pb-1 ${onReveal}`}
        >
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${labels.thumbnail} ${i + 1}`}
              aria-current={i === index}
              className={`h-14 w-16 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-white/5 p-1 ring-1 transition-all duration-200 ${
                i === index
                  ? "ring-2 ring-gold"
                  : "opacity-70 ring-white/15 hover:opacity-100 hover:ring-white/40"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                loading="lazy"
                className="h-full w-full object-contain"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

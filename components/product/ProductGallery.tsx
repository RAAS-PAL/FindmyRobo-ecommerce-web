"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
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
  labels: {
    previous: string;
    next: string;
    thumbnail: string;
    openFullscreen: string;
    closeFullscreen: string;
    imageCount: string;
  };
}) {
  const [index, setIndex] = useState(0);
  const openerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const images = [product.imageUrl, ...(product.images ?? [])].filter(
    (url): url is string => !!url
  );

  const go = (next: number) => setIndex((next + images.length) % images.length);

  const openFullscreen = () => dialogRef.current?.showModal();
  const closeFullscreen = () => dialogRef.current?.close();

  const lightbox = images[index] ? (
        <dialog
          ref={dialogRef}
          role="dialog"
          aria-label={product.name}
          onClose={() => openerRef.current?.focus()}
          onKeyDown={(event) => {
            if (images.length > 1 && event.key === "ArrowLeft") {
              event.preventDefault();
              go(index - 1);
            }
            if (images.length > 1 && event.key === "ArrowRight") {
              event.preventDefault();
              go(index + 1);
            }
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeFullscreen();
          }}
          className="fixed inset-0 z-[100] m-0 h-screen max-h-none w-screen max-w-none border-0 bg-black/92 p-4 backdrop:bg-black/70 backdrop:backdrop-blur-sm open:flex open:items-center open:justify-center sm:p-8"
        >
          <button
            type="button"
            autoFocus
            onClick={closeFullscreen}
            aria-label={labels.closeFullscreen}
            className="absolute right-4 top-4 z-10 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-7 sm:top-7"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label={labels.previous}
                className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-7"
              >
                <ChevronLeft className="h-6 w-6" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label={labels.next}
                className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-7"
              >
                <ChevronRight className="h-6 w-6" aria-hidden="true" />
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[index]}
            alt={index === 0 ? product.name : `${product.name} — ${index + 1}`}
            className="max-h-[calc(100vh-7rem)] max-w-[calc(100vw-2rem)] select-none object-contain sm:max-w-[calc(100vw-8rem)]"
          />
          <p aria-live="polite" className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-xs text-white/70 sm:bottom-6">
            {labels.imageCount.replace("#current#", String(index + 1)).replace("#total#", String(images.length))}
          </p>
        </dialog>
      ) : null;

  const panelClass =
    "relative flex min-h-[460px] flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest to-forest-800 p-5 sm:min-h-[600px] sm:p-7 lg:min-h-[660px]";
  const glow = (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/20 blur-[90px]"
      aria-hidden="true"
    />
  );

  if (images.length < 2) {
    return (
      <>
        <div className={`${panelClass} items-center justify-center`}>
          {glow}
          {images.length === 1 ? (
            <button
              ref={openerRef}
              type="button"
              onClick={openFullscreen}
              aria-label={labels.openFullscreen}
              className="group/image relative flex h-full w-full cursor-zoom-in items-center justify-center"
            >
              <ProductVisual
                product={product}
                className="relative mx-auto h-[400px] max-h-full w-full drop-shadow-[0_24px_40px_rgba(0,0,0,0.55)] transition-transform duration-300 group-hover/image:scale-[1.02] sm:h-[560px] lg:h-[620px]"
              />
              <span className="absolute bottom-3 right-3 flex items-center gap-2 rounded-lg bg-black/55 px-3 py-2 text-xs font-semibold text-white opacity-0 backdrop-blur-sm transition-opacity group-hover/image:opacity-100 group-focus-visible/image:opacity-100">
                <Maximize2 className="h-4 w-4" aria-hidden="true" />
                {labels.openFullscreen}
              </span>
            </button>
          ) : (
            <ProductVisual
              product={product}
              className="relative mx-auto h-[400px] max-h-full w-full drop-shadow-[0_24px_40px_rgba(0,0,0,0.55)] sm:h-[560px] lg:h-[620px]"
            />
          )}
        </div>
        {lightbox}
      </>
    );
  }

  // hidden at rest, revealed while the panel is hovered or holds focus
  const onReveal =
    "opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100";

  return (
    <div className={`group ${panelClass}`}>
      {glow}

      {/* stage — every photo stays mounted so switching never re-fetches */}
      <button
        ref={openerRef}
        type="button"
        onClick={openFullscreen}
        aria-label={labels.openFullscreen}
        className="group/image relative flex-1 cursor-zoom-in"
      >
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={i === 0 ? product.name : `${product.name} — ${i + 1}`}
            aria-hidden={i !== index}
            loading={i === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 h-full w-full object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.55)] transition-opacity duration-500 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <span className="absolute bottom-3 right-3 flex items-center gap-2 rounded-lg bg-black/55 px-3 py-2 text-xs font-semibold text-white opacity-0 backdrop-blur-sm transition-opacity group-hover/image:opacity-100 group-focus-visible/image:opacity-100">
          <Maximize2 className="h-4 w-4" aria-hidden="true" />
          {labels.openFullscreen}
        </span>
      </button>

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
      {lightbox}
    </div>
  );
}

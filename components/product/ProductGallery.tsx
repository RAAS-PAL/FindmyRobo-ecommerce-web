"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn, ZoomOut } from "lucide-react";
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
 * Fullscreen (the lightbox) supports zoom: scroll to zoom at the cursor, click
 * to toggle 2.5×, drag to pan, on-screen +/- controls, and +/-/0 keys.
 *
 * Falls back to the plain single visual (photo or variant illustration) when
 * the product has fewer than two photos.
 */
const MAX_ZOOM = 5;

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
    zoomIn: string;
    zoomOut: string;
  };
}) {
  const [index, setIndex] = useState(0);
  const openerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const images = [product.imageUrl, ...(product.images ?? [])].filter(
    (url): url is string => !!url
  );

  /* ---------- fullscreen zoom & pan ---------- */
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef({ x: 0, y: 0, panX: 0, panY: 0, moved: false, active: false });

  const clampPan = (x: number, y: number, z: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    const w = rect?.width ?? 800;
    const h = rect?.height ?? 600;
    const mx = (w / 2) * (z - 1) + 120;
    const my = (h / 2) * (z - 1) + 120;
    return { x: Math.max(-mx, Math.min(mx, x)), y: Math.max(-my, Math.min(my, y)) };
  };
  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const center = (e: { clientX: number; clientY: number }) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return { cx: 0, cy: 0 };
    return { cx: e.clientX - rect.left - rect.width / 2, cy: e.clientY - rect.top - rect.height / 2 };
  };
  const zoomTo = (next: number, cx: number, cy: number) => {
    const nz = Math.min(MAX_ZOOM, Math.max(1, next));
    if (nz <= 1) return resetZoom();
    const ratio = nz / zoom;
    setZoom(nz);
    setPan((p) => clampPan(cx - (cx - p.x) * ratio, cy - (cy - p.y) * ratio, nz));
  };
  const onWheel = (e: React.WheelEvent) => {
    const { cx, cy } = center(e);
    zoomTo(zoom * (e.deltaY < 0 ? 1.2 : 1 / 1.2), cx, cy);
  };
  const onStageClick = (e: React.MouseEvent) => {
    if (dragRef.current.moved) return;
    if (e.target === imgRef.current) {
      if (zoom > 1) return resetZoom();
      const { cx, cy } = center(e);
      zoomTo(2.5, cx, cy);
    } else if (zoom > 1) {
      resetZoom();
    } else {
      closeFullscreen();
    }
  };
  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current.moved = false;
    if (zoom <= 1) return;
    dragRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y, moved: false, active: true };
    setDragging(true);
    stageRef.current?.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true;
    setPan(clampPan(dragRef.current.panX + dx, dragRef.current.panY + dy, zoom));
  };
  const onPointerUp = () => {
    dragRef.current.active = false;
    setDragging(false);
  };

  const go = (next: number) => {
    resetZoom();
    setIndex((next + images.length) % images.length);
  };

  const openFullscreen = () => {
    resetZoom();
    dialogRef.current?.showModal();
  };
  const closeFullscreen = () => dialogRef.current?.close();

  const lightbox = images[index] ? (
        <dialog
          ref={dialogRef}
          role="dialog"
          aria-label={product.name}
          onClose={() => {
            resetZoom();
            openerRef.current?.focus();
          }}
          onKeyDown={(event) => {
            if (images.length > 1 && event.key === "ArrowLeft") {
              event.preventDefault();
              go(index - 1);
            }
            if (images.length > 1 && event.key === "ArrowRight") {
              event.preventDefault();
              go(index + 1);
            }
            if (event.key === "+" || event.key === "=") {
              event.preventDefault();
              zoomTo(zoom * 1.4, 0, 0);
            }
            if (event.key === "-" || event.key === "_") {
              event.preventDefault();
              zoomTo(zoom / 1.4, 0, 0);
            }
            if (event.key === "0") {
              event.preventDefault();
              resetZoom();
            }
          }}
          className="fixed inset-0 z-[100] m-0 h-screen max-h-none w-screen max-w-none overflow-hidden border-0 bg-black/92 p-4 backdrop:bg-black/70 backdrop:backdrop-blur-sm open:flex open:items-center open:justify-center sm:p-8"
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

          {/* zoom stage */}
          <div
            ref={stageRef}
            onWheel={onWheel}
            onClick={onStageClick}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="flex h-full w-full items-center justify-center overflow-hidden"
            style={{
              cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in",
              touchAction: "none",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={images[index]}
              alt={index === 0 ? product.name : `${product.name} — ${index + 1}`}
              draggable={false}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transition: dragging ? "none" : "transform 0.18s ease-out",
              }}
              className="max-h-[calc(100vh-7rem)] max-w-[calc(100vw-2rem)] select-none object-contain sm:max-w-[calc(100vw-8rem)]"
            />
          </div>

          {/* zoom controls */}
          <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white/10 p-1 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => zoomTo(zoom / 1.4, 0, 0)}
              aria-label={labels.zoomOut}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/20"
            >
              <ZoomOut className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={resetZoom}
              aria-label={`${Math.round(zoom * 100)}%`}
              className="min-w-[3.25rem] cursor-pointer rounded-full px-2 py-1.5 text-center font-mono text-xs text-white transition-colors hover:bg-white/20"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={() => zoomTo(zoom * 1.4, 0, 0)}
              aria-label={labels.zoomIn}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/20"
            >
              <ZoomIn className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <p aria-live="polite" className="absolute bottom-7 left-5 font-mono text-xs text-white/70">
            {labels.imageCount.replace("#current#", String(index + 1)).replace("#total#", String(images.length))}
          </p>
        </dialog>
      ) : null;

  // Light mode: soft grey studio backdrop. Dark mode: near-black gradient.
  const panelClass =
    "relative flex min-h-[460px] flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-100 via-neutral-200 to-neutral-300 p-5 dark:from-forest-950 dark:via-forest dark:to-forest-800 sm:min-h-[600px] sm:p-7 lg:min-h-[660px]";
  const glow = (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[90px] dark:bg-gold/25"
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

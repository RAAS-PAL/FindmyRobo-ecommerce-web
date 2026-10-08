"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight, MessageCircle, QrCode } from "lucide-react";
import { useSiteContent } from "@/components/SiteContentProvider";

/**
 * "Prefer to chat?" — the LINE official account as a button that opens its QR
 * code, for visitors who would rather message than fill in a form.
 *
 * The popover also carries an "Open in LINE" link: on a phone the QR is on
 * the very screen that would have to scan it, so the link is what works there.
 * LINE id, link and QR image come from Admin → Content → Contact. The green
 * (#06C755) is LINE's, as on the /contact-sales LINE card.
 */
export default function LineChatButton() {
  const t = useTranslations("heroQuote");
  const { lineId, lineUrl, lineQrImage } = useSiteContent().contact;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!lineId) return null;

  return (
    <div ref={rootRef} className="relative">
      <p className="text-[12px] font-medium text-ink-muted">{t("chatPrompt")}</p>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={popoverId}
        aria-label={t("lineShowQr", { id: lineId })}
        // grey, not LINE green: a quiet second option beside the blue quote card
        className="mt-1.5 flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-full border border-forest-100 bg-surface py-1 pr-3.5 pl-1 text-[13.5px] font-bold text-content transition-colors hover:bg-cloud focus-visible:outline-none! focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-700 text-white">
          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <span>LINE {lineId}</span>
        <QrCode className="ml-auto h-4 w-4 text-ink-muted" aria-hidden="true" />
      </button>

      {open && (
        <div
          id={popoverId}
          role="dialog"
          aria-label={t("lineQrAlt", { id: lineId })}
          className="absolute inset-x-0 bottom-full z-30 mx-auto mb-3 w-60 rounded-2xl border border-black/8 bg-surface p-4 text-center shadow-[0_24px_48px_-20px_rgba(10,10,11,0.45)] dark:border-white/10"
        >
          {lineQrImage && (
            // bg-white, not bg-surface: a QR needs a light quiet zone to stay
            // scannable, and in dark mode `surface` is near-black. A plain
            // <img>: the QR can be uploaded to any host in the CMS.
            <div className="mx-auto h-40 w-40 overflow-hidden rounded-xl bg-white p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lineQrImage}
                alt={t("lineQrAlt", { id: lineId })}
                className="h-full w-full object-contain"
              />
            </div>
          )}
          <p className="mt-3 font-display text-[15px] font-bold text-content">{lineId}</p>
          {lineQrImage && <p className="text-[12px] text-ink-muted">{t("lineScan")}</p>}
          {lineUrl && (
            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              // dark text: white on LINE green
              // is too faint to read at this size
              className="mt-3 flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#06C755] text-[13px] font-bold text-forest-950 transition-opacity hover:opacity-90"
            >
              {t("lineOpen")}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

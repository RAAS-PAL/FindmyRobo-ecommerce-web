"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ExternalLink, LoaderCircle, Monitor, RotateCw, Smartphone } from "lucide-react";
import type { ContentSection } from "@/data/siteContent";
import {
  PREVIEW_CONTENT,
  PREVIEW_PARAM,
  PREVIEW_READY,
  PREVIEW_SCROLL,
  type PreviewTarget,
} from "@/lib/cmsPreview";

/** Viewport widths the page is laid out at before being scaled into the pane. */
const DEVICE_WIDTH = { desktop: 1280, mobile: 390 } as const;
type Device = keyof typeof DEVICE_WIDTH;
type Lang = "th" | "en";

/** Post to the preview frame — only ever to our own origin (lib/cmsPreview.ts). */
function postTo(frame: HTMLIFrameElement | null, message: object) {
  frame?.contentWindow?.postMessage(message, window.location.origin);
}

/** Storefront URL for a locale-less path — Thai has no prefix, English is /en. */
export function storefrontPath(path: string, lang: Lang) {
  if (lang === "th") return path;
  return path === "/" ? "/en" : `/en${path}`;
}

/** Toolbar toggle button, shared with the SEO preview. */
export function ToggleButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={label}
      aria-label={label}
      className={`flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-full px-2.5 text-[12px] font-bold transition-colors ${
        active ? "bg-forest-950 text-gold dark:bg-gold dark:text-forest-950" : "text-ink-muted hover:text-content"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * The real storefront page in a frame, with the editor's unpublished draft
 * pushed into it as it changes (protocol in lib/cmsPreview.ts). Rendered at a
 * real device width and scaled down to the pane, so the desktop layout shows
 * as a desktop layout rather than as whatever a 600px-wide frame would give.
 */
export default function LivePreview({
  section,
  draft,
  path,
  scrollRequest,
  dirty,
}: {
  section: ContentSection;
  draft: unknown;
  /** Storefront path without locale, e.g. "/" or "/about". */
  path: string;
  /** Latest panel the editor is working in; `n` re-fires the same target. */
  scrollRequest: { target: PreviewTarget; n: number } | null;
  dirty: boolean;
}) {
  const t = useTranslations("admin.content.preview");
  const frameRef = useRef<HTMLIFrameElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [lang, setLang] = useState<Lang>("th");
  const [device, setDevice] = useState<Device>("desktop");
  const [reloadKey, setReloadKey] = useState(0);
  const [ready, setReady] = useState(false);
  const [box, setBox] = useState({ width: 0, height: 0 });

  // Latest values for the message handler, which is attached once.
  const draftRef = useRef(draft);
  const scrollRef = useRef(scrollRequest);
  useEffect(() => {
    draftRef.current = draft;
    scrollRef.current = scrollRequest;
  });

  // The frame announces itself once its listener is up; answer with the draft
  // (and the section being edited) so the first paint is already the draft.
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      if ((event.data as { type?: string })?.type !== PREVIEW_READY) return;
      setReady(true);
      postTo(frameRef.current, { type: PREVIEW_CONTENT, section, content: draftRef.current });
      if (scrollRef.current) {
        postTo(frameRef.current, { type: PREVIEW_SCROLL, target: scrollRef.current.target });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [section]);

  // Every edit, lightly debounced so a pasted video link is not fetched once
  // per keystroke.
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(
      () => postTo(frameRef.current, { type: PREVIEW_CONTENT, section, content: draft }),
      250
    );
    return () => clearTimeout(timer);
  }, [draft, ready, section]);

  useEffect(() => {
    if (ready && scrollRequest) {
      postTo(frameRef.current, { type: PREVIEW_SCROLL, target: scrollRequest.target });
    }
  }, [scrollRequest, ready]);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) =>
      setBox({ width: entry.contentRect.width, height: entry.contentRect.height })
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const frameWidth = DEVICE_WIDTH[device];
  const scale = box.width ? Math.min(1, box.width / frameWidth) : 1;
  const src = `${storefrontPath(path, lang)}?${PREVIEW_PARAM}=1`;
  const reload = () => {
    setReady(false);
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-forest-100 px-3 py-2">
        <div className="flex items-center gap-1 rounded-full border border-forest-100 p-0.5">
          {(["th", "en"] as const).map((l) => (
            <ToggleButton
              key={l}
              active={lang === l}
              label={l === "th" ? t("thai") : t("english")}
              onClick={() => {
                if (l !== lang) setReady(false);
                setLang(l);
              }}
            >
              {l.toUpperCase()}
            </ToggleButton>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-full border border-forest-100 p-0.5">
          <ToggleButton active={device === "desktop"} label={t("desktop")} onClick={() => setDevice("desktop")}>
            <Monitor className="h-4 w-4" aria-hidden="true" />
          </ToggleButton>
          <ToggleButton active={device === "mobile"} label={t("mobile")} onClick={() => setDevice("mobile")}>
            <Smartphone className="h-4 w-4" aria-hidden="true" />
          </ToggleButton>
        </div>
        <div className="flex items-center gap-1">
          <ToggleButton active={false} label={t("reload")} onClick={reload}>
            <RotateCw className="h-4 w-4" aria-hidden="true" />
          </ToggleButton>
          <a
            href={storefrontPath(path, lang)}
            target="_blank"
            rel="noreferrer"
            title={t("openLive")}
            aria-label={t("openLive")}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:text-content"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>

      <p
        className={`px-3 py-1.5 text-center font-mono text-[10.5px] font-semibold uppercase tracking-wider ${
          dirty ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" : "bg-cloud text-ink-muted"
        }`}
      >
        {dirty ? t("showingDraft") : t("showingLive")}
      </p>

      <div ref={boxRef} className="relative min-h-0 flex-1 overflow-hidden bg-cloud">
        {box.width > 0 && (
          <div
            className={`absolute top-0 ${device === "mobile" ? "left-1/2" : "left-0"}`}
            style={{
              width: frameWidth,
              height: box.height / scale,
              transform:
                device === "mobile"
                  ? `translateX(-50%) scale(${scale})`
                  : `scale(${scale})`,
              transformOrigin: device === "mobile" ? "top center" : "top left",
            }}
          >
            <iframe
              key={`${src}-${reloadKey}`}
              ref={frameRef}
              src={src}
              title={t("frameTitle")}
              onLoad={() => {
                // A frame that loads without announcing itself (an error page,
                // a page outside the storefront) should not spin forever.
                window.setTimeout(() => setReady(true), 4000);
              }}
              className={`h-full w-full border-0 bg-surface ${
                device === "mobile" ? "border-x border-forest-100 shadow-xl" : ""
              }`}
            />
          </div>
        )}
        {!ready && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-cloud/70">
            <span className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-muted">
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              {t("loading")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

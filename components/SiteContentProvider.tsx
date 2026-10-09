"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { isLivePreviewEvent, mergeData, ready } from "@payloadcms/live-preview";
import {
  isContentSection,
  type ContentSection,
  type PublicSiteContent,
  type SiteContent,
} from "@/data/siteContent";
import { draftFromPayload } from "@/lib/payloadContent";
import { rebaseMedia } from "@/lib/media";
import { PREVIEW_PARAM, PREVIEW_SESSION_KEY } from "@/lib/cmsPreview";

interface SiteContentContextValue {
  content: PublicSiteContent;
  /** Unsaved drafts from the CMS Live Preview (empty on the real site). */
  drafts: Partial<SiteContent>;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

/** Is this page the CMS's Live Preview frame? (lib/cmsPreview.ts) */
function inPreviewFrame(): boolean {
  if (window.self === window.top) return false;
  try {
    if (new URLSearchParams(window.location.search).has(PREVIEW_PARAM)) {
      sessionStorage.setItem(PREVIEW_SESSION_KEY, "1");
      return true;
    }
    return sessionStorage.getItem(PREVIEW_SESSION_KEY) === "1";
  } catch {
    return new URLSearchParams(window.location.search).has(PREVIEW_PARAM);
  }
}

/**
 * Serves the CMS content (Payload, /cms) to client components — the hero,
 * showcase, video gallery, stats, announcement bar, footer. It is read on the
 * server once per render (lib/siteContentStore.ts) and handed down here, the
 * same way ProductsProvider serves the catalogue.
 *
 * It is also the storefront end of Payload's Live Preview: inside the CMS's
 * frame, the draft the editor is typing replaces the published content here,
 * so the page updates as they type.
 */
export default function SiteContentProvider({
  content,
  children,
}: {
  content: PublicSiteContent;
  children: React.ReactNode;
}) {
  const [drafts, setDrafts] = useState<Partial<SiteContent>>({});

  useEffect(() => {
    if (!inPreviewFrame()) return;
    const origin = window.location.origin;
    // Drafts are merged by a request to the CMS (it turns media ids into
    // URLs); a slow reply must not overwrite a newer one.
    let latest = 0;

    const onMessage = async (event: MessageEvent) => {
      if (event.source !== window.parent || !isLivePreviewEvent(event, origin)) return;
      const { data, globalSlug, locale } = event.data as {
        data?: unknown;
        globalSlug?: string;
        locale?: string;
      };
      if (!globalSlug || !isContentSection(globalSlug)) return;
      const section: ContentSection = globalSlug;
      const ticket = ++latest;
      try {
        const merged = await mergeData({
          apiRoute: "/cms-api",
          depth: 1,
          globalSlug,
          incomingData: data as Record<string, unknown>,
          initialData: {},
          locale: locale ?? "en",
          serverURL: origin,
        });
        if (ticket !== latest) return;
        setDrafts((prev) => ({ ...prev, [section]: rebaseMedia(draftFromPayload(section, merged)) }));
      } catch (error) {
        console.error("Live Preview: could not apply the draft", error);
      }
    };

    window.addEventListener("message", onMessage);
    ready({ serverURL: origin });
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const value = useMemo<SiteContentContextValue>(
    () => ({
      content: {
        home: drafts.home ?? content.home,
        contact: drafts.contact ?? content.contact,
        announcement: drafts.announcement ?? content.announcement,
      },
      drafts,
    }),
    [content, drafts]
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

function useSiteContentContext(): SiteContentContextValue {
  const ctx = useContext(SiteContentContext);
  if (!ctx) {
    throw new Error("useSiteContent must be used within <SiteContentProvider>");
  }
  return ctx;
}

export function useSiteContent(): PublicSiteContent {
  return useSiteContentContext().content;
}

/**
 * For sections a page loads itself on the server (About): the published
 * value, or the CMS draft of it while previewing.
 */
export function useLiveSection<S extends ContentSection>(
  section: S,
  published: SiteContent[S]
): SiteContent[S] {
  return (useSiteContentContext().drafts[section] as SiteContent[S] | undefined) ?? published;
}

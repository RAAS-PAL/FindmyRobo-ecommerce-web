"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  isContentSection,
  type ContentSection,
  type PublicSiteContent,
  type SiteContent,
} from "@/data/siteContent";
import { PREVIEW_CONTENT, PREVIEW_PARAM, PREVIEW_READY, PREVIEW_SCROLL } from "@/lib/cmsPreview";

interface SiteContentContextValue {
  content: PublicSiteContent;
  /** Unpublished drafts pushed in by the admin live preview (empty on the real site). */
  drafts: Partial<SiteContent>;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

/**
 * Serves the admin-edited content (Admin → Content) to client components —
 * the hero, showcase, video gallery, stats, announcement bar, footer. It is
 * read on the server once per render (lib/siteContentStore.ts) and handed
 * down here, the same way ProductsProvider serves the catalogue.
 *
 * It is also the receiving end of the editor's live preview (lib/cmsPreview.ts):
 * inside the editor's frame, drafts posted by the editor replace the published
 * content on the client, so the page updates as marketing types.
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
    // Only inside a frame, and only when the editor asked for a preview.
    if (window.self === window.top) return;
    if (!new URLSearchParams(window.location.search).has(PREVIEW_PARAM)) return;

    const onMessage = (event: MessageEvent) => {
      // Same-origin parent only — see lib/cmsPreview.ts.
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      const data = event.data as { type?: string; section?: string; content?: unknown; target?: string };
      if (data?.type === PREVIEW_CONTENT && typeof data.section === "string" && isContentSection(data.section)) {
        const section: ContentSection = data.section;
        setDrafts((prev) => ({ ...prev, [section]: data.content }));
      } else if (data?.type === PREVIEW_SCROLL && typeof data.target === "string") {
        document
          .querySelector(`[data-cms="${CSS.escape(data.target)}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: PREVIEW_READY }, window.location.origin);
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
 * For sections a page loads itself on the server (About): the server value,
 * or the editor's draft of it while previewing.
 */
export function useLiveSection<S extends ContentSection>(
  section: S,
  published: SiteContent[S]
): SiteContent[S] {
  return (useSiteContentContext().drafts[section] as SiteContent[S] | undefined) ?? published;
}

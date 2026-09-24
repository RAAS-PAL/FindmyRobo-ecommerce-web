"use client";

import { createContext, useContext } from "react";
import type { PublicSiteContent } from "@/data/siteContent";

const SiteContentContext = createContext<PublicSiteContent | null>(null);

/**
 * Serves the admin-edited content (Admin → Content) to client components —
 * the hero, showcase, video gallery, stats and YouTube block. It is read on
 * the server once per render (lib/siteContentStore.ts) and handed down here,
 * the same way ProductsProvider serves the catalogue.
 *
 * Only the sections client components need are passed: About and SEO are
 * read directly by server components and never reach the browser.
 */
export default function SiteContentProvider({
  content,
  children,
}: {
  content: PublicSiteContent;
  children: React.ReactNode;
}) {
  return <SiteContentContext.Provider value={content}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent(): PublicSiteContent {
  const ctx = useContext(SiteContentContext);
  if (!ctx) {
    throw new Error("useSiteContent must be used within <SiteContentProvider>");
  }
  return ctx;
}

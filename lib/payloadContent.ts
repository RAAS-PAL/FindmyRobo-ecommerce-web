import type {
  About as PayloadAbout,
  Announcement as PayloadAnnouncement,
  Contact as PayloadContact,
  Home as PayloadHome,
  Media,
  Seo as PayloadSeo,
} from "@/payload-types";
import {
  DEFAULT_CONTENT,
  type AboutContent,
  type AnnouncementContent,
  type Bilingual,
  type ContactContent,
  type ContentSection,
  type HomeContent,
  type SeoContent,
  type SiteContent,
} from "@/data/siteContent";
import type { AboutValue } from "@/data/about";

/**
 * Payload global documents → the content shapes the storefront renders
 * (data/siteContent.ts). Pure and client-safe: the server uses it for the
 * published content, and the Live Preview listener uses it for drafts.
 *
 * Payload returns nulls for empty fields and adds row ids to arrays; this is
 * where both are smoothed away, so components never see either.
 */

const bi = (v: { en?: string | null; th?: string | null } | null | undefined): Bilingual => ({
  en: v?.en ?? "",
  th: v?.th ?? "",
});

/** A media-library image — populated doc, bare id (not yet populated), or nothing. */
const mediaUrl = (m: number | string | Media | null | undefined): string =>
  m && typeof m === "object" ? (m.url ?? "") : "";

const str = (v: string | null | undefined) => v ?? "";

/** Paragraph text stored as one textarea per language, split on blank lines. */
const paragraphs = (text: string | null | undefined) =>
  (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

export function homeFromPayload(doc: Partial<PayloadHome>): HomeContent {
  return {
    heroHeadline: bi(doc.heroHeadline),
    heroAccent: bi(doc.heroAccent),
    heroSub: bi(doc.heroSub),
    heroVideos: (doc.heroVideos ?? []).map((v) => str(v.url)).filter(Boolean),
    featureShowcase: (doc.featureShowcase ?? []).map((f) => ({
      image: mediaUrl(f.image),
      heading: bi(f.heading),
      body: bi(f.body),
    })),
    videoGallery: (doc.videoGallery ?? []).map((v) => {
      const poster = mediaUrl(v.poster);
      return {
        url: str(v.url),
        title: str(v.title),
        ...(poster ? { poster } : {}),
        ...(v.tag ? { tag: v.tag } : {}),
        ...(v.author ? { author: v.author } : {}),
      };
    }),
    trustHeading: bi(doc.trustHeading),
    trustBody: bi(doc.trustBody),
    trustStats: (doc.trustStats ?? []).map((s) => ({
      value: typeof s.value === "number" ? s.value : 0,
      decimals: typeof s.decimals === "number" ? s.decimals : 0,
      suffix: str(s.suffix),
      label: bi(s.label),
    })),
  };
}

export function announcementFromPayload(doc: Partial<PayloadAnnouncement>): AnnouncementContent {
  return {
    enabled: doc.enabled !== false,
    messages: (doc.messages ?? []).map((m) => bi(m.message)),
  };
}

export function aboutFromPayload(doc: Partial<PayloadAbout>): AboutContent {
  return {
    intro: bi(doc.intro),
    stats: (doc.stats ?? []).map((s) => ({ value: str(s.value), label: bi(s.label) })),
    storyBody: { en: paragraphs(doc.storyBody?.en), th: paragraphs(doc.storyBody?.th) },
    storyImage: mediaUrl(doc.storyImage),
    partnerEnabled: doc.partnerEnabled !== false,
    partnerEyebrow: bi(doc.partnerEyebrow),
    partnerName: str(doc.partnerName),
    partnerStatus: bi(doc.partnerStatus),
    partnerBody: bi(doc.partnerBody),
    partnerLogo: mediaUrl(doc.partnerLogo),
    values: (doc.values ?? []).map((v) => ({
      icon: (v.icon ?? "shield") as AboutValue["icon"],
      title: bi(v.title),
      body: bi(v.body),
    })),
    milestones: (doc.milestones ?? []).map((m) => ({
      when: str(m.when),
      title: bi(m.title),
      body: bi(m.body),
    })),
    team: (doc.team ?? []).map((t) => ({
      name: str(t.name),
      role: bi(t.role),
      photo: mediaUrl(t.photo) || null,
    })),
  };
}

export function contactFromPayload(doc: Partial<PayloadContact>): ContactContent {
  return {
    phone: str(doc.phone),
    phoneHours: bi(doc.phoneHours),
    email: str(doc.email),
    lineId: str(doc.lineId),
    lineUrl: str(doc.lineUrl),
    lineQrImage: mediaUrl(doc.lineQrImage),
    socials: {
      facebook: str(doc.socials?.facebook),
      youtube: str(doc.socials?.youtube),
      tiktok: str(doc.socials?.tiktok),
    },
  };
}

export function seoFromPayload(doc: Partial<PayloadSeo>): SeoContent {
  const products: SeoContent["products"] = {};
  for (const row of doc.products ?? []) {
    if (row.productId) products[row.productId] = { title: bi(row.title), description: bi(row.description) };
  }
  return {
    siteTitle: bi(doc.siteTitle),
    siteDescription: bi(doc.siteDescription),
    shareImage: mediaUrl(doc.shareImage) || DEFAULT_CONTENT.seo.shareImage,
    products,
  };
}

const MAPPERS: { [S in ContentSection]: (doc: never) => SiteContent[S] } = {
  home: homeFromPayload,
  announcement: announcementFromPayload,
  about: aboutFromPayload,
  contact: contactFromPayload,
  seo: seoFromPayload,
};

/**
 * One global as storefront content. A global that has never been published
 * (no `updatedAt`) shows the built-in default rather than empty fields.
 */
export function sectionFromPayload<S extends ContentSection>(section: S, doc: unknown): SiteContent[S] {
  if (!doc || typeof doc !== "object" || !(doc as { updatedAt?: unknown }).updatedAt) {
    return DEFAULT_CONTENT[section];
  }
  return (MAPPERS[section] as (doc: unknown) => SiteContent[S])(doc);
}

/** A Live Preview draft: always mapped, published or not. */
export function draftFromPayload<S extends ContentSection>(section: S, doc: unknown): SiteContent[S] {
  return (MAPPERS[section] as (doc: unknown) => SiteContent[S])(doc ?? {});
}

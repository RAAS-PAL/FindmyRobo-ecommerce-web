import {
  SOCIAL_PLATFORMS,
  type AboutContent,
  type AnnouncementContent,
  type Bilingual,
  type ContactContent,
  type ContentSection,
  type GalleryVideo,
  type HomeContent,
  type HomeStat,
  type SeoContent,
  type SeoOverride,
  type ShowcaseFeature,
  type SiteContent,
} from "@/data/siteContent";
import type { AboutStat, AboutValue, Milestone, TeamMember } from "@/data/about";

/**
 * Server-side validation for Admin → Content saves. Everything the browser
 * sends is re-checked here, because this JSON is rendered on every page:
 * links end up in href/src attributes, so a `javascript:` URL here would run
 * on every visitor's machine. React escapes text, but it does not vet URLs.
 *
 * Draft-friendly, like the product page builder: list rows left completely
 * blank are dropped rather than rejected. A row that is half-filled is an
 * error, because it would render half-empty.
 */

class Invalid extends Error {}

/** Throws a message naming the field, so the editor can say what to fix. */
function fail(path: string, problem: string): never {
  throw new Invalid(`${path}: ${problem}`);
}

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj =>
  typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Obj) : {};

function text(v: unknown, path: string, max: number, required = false): string {
  const s = typeof v === "string" ? v.trim() : "";
  if (required && !s) fail(path, "required");
  if (s.length > max) fail(path, `at most ${max} characters (now ${s.length})`);
  return s;
}

/** Both languages, each optional unless `required`, which demands both. */
function bilingual(v: unknown, path: string, max: number, required = false): Bilingual {
  const o = obj(v);
  return {
    en: text(o.en, `${path} (EN)`, max, required),
    th: text(o.th, `${path} (TH)`, max, required),
  };
}

const isBlank = (b: Bilingual) => !b.en && !b.th;

/**
 * An absolute http(s) URL, or a path on this site ("/posters/x.webp"). Not
 * "//host/x": that is protocol-relative, i.e. someone else's site.
 */
const LINK_RE = /^(https?:\/\/[^\s/]+[^\s]*|\/(?!\/)[^\s]*)$/i;

function link(v: unknown, path: string, required = false): string {
  const s = text(v, path, 2048, required);
  if (s && !LINK_RE.test(s)) fail(path, "must start with https:// or /");
  return s;
}

/** Social profiles must be full https links — a bare path would point at us. */
function externalLink(v: unknown, path: string): string {
  const s = link(v, path);
  if (s && !/^https:\/\//i.test(s)) fail(path, "must start with https://");
  return s;
}

function num(v: unknown, path: string, min: number, max: number): number {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() ? Number(v) : NaN;
  if (!Number.isFinite(n)) fail(path, "must be a number");
  if (n < min || n > max) fail(path, `must be between ${min} and ${max}`);
  return n;
}

/**
 * A list of rows. `isEmpty` decides which rows count as untouched and get
 * dropped; everything else goes through `parse`, which may throw.
 */
function list<T>(
  v: unknown,
  path: string,
  max: number,
  isEmpty: (row: Obj) => boolean,
  parse: (row: Obj, rowPath: string) => T
): T[] {
  const rows = (Array.isArray(v) ? v : []).map(obj).filter((row) => !isEmpty(row));
  if (rows.length > max) fail(path, `at most ${max} items`);
  return rows.map((row, i) => parse(row, `${path} #${i + 1}`));
}

/** Every value in the row is an empty string / blank bilingual / missing. */
function blankRow(row: Obj): boolean {
  return Object.values(row).every((value) => {
    if (typeof value === "string") return value.trim() === "";
    if (typeof value === "number" || typeof value === "boolean") return true;
    if (value && typeof value === "object") return blankRow(value as Obj);
    return true;
  });
}

/* --------------------------------------------------------------- sections */

function parseAnnouncement(input: Obj): AnnouncementContent {
  return {
    enabled: input.enabled === true,
    messages: list(input.messages, "Announcement", 6, blankRow, (row, p) =>
      bilingual(row, p, 140, true)
    ),
  };
}

function parseHome(input: Obj): HomeContent {
  const videos = (Array.isArray(input.heroVideos) ? input.heroVideos : []).filter(
    (v) => typeof v === "string" && v.trim()
  );
  if (videos.length > 6) fail("Hero videos", "at most 6");

  return {
    heroHeadline: bilingual(input.heroHeadline, "Hero headline", 80, true),
    heroAccent: bilingual(input.heroAccent, "Hero second line", 80),
    heroSub: bilingual(input.heroSub, "Hero text", 300, true),
    heroVideos: videos.map((v, i) => link(v, `Hero video #${i + 1}`, true)),
    featureShowcase: list(
      input.featureShowcase,
      "Feature showcase",
      8,
      blankRow,
      (row, p): ShowcaseFeature => ({
        image: link(row.image, `${p} image`, true),
        heading: bilingual(row.heading, `${p} heading`, 80, true),
        body: bilingual(row.body, `${p} text`, 400, true),
      })
    ),
    videoGallery: list(
      input.videoGallery,
      "Video gallery",
      12,
      blankRow,
      (row, p): GalleryVideo => {
        const poster = link(row.poster, `${p} thumbnail`);
        const author = text(row.author, `${p} credit`, 60);
        const tag = text(row.tag, `${p} tag`, 40);
        return {
          url: link(row.url, `${p} video link`, true),
          title: text(row.title, `${p} title`, 100, true),
          ...(poster ? { poster } : {}),
          ...(author ? { author } : {}),
          ...(tag ? { tag } : {}),
        };
      }
    ),
    trustHeading: bilingual(input.trustHeading, "Who We Are heading", 120, true),
    trustBody: bilingual(input.trustBody, "Who We Are text", 600, true),
    trustStats: list(
      input.trustStats,
      "Who We Are stats",
      3,
      (row) => isBlank(bilingual(row.label, "", 1e6)),
      (row, p): HomeStat => ({
        value: num(row.value, `${p} number`, 0, 1_000_000_000),
        decimals: Math.round(num(row.decimals ?? 0, `${p} decimals`, 0, 2)),
        suffix: text(row.suffix, `${p} suffix`, 4),
        label: bilingual(row.label, `${p} label`, 40, true),
      })
    ),
  };
}

/** Phone numbers as people write them: digits, spaces, dashes, + and (). */
const PHONE_RE = /^[0-9+()\-\s]{6,24}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseContact(input: Obj): ContactContent {
  const phone = text(input.phone, "Phone", 24, true);
  if (!PHONE_RE.test(phone)) fail("Phone", "digits, spaces, dashes, + and brackets only");
  const email = text(input.email, "Email", 120, true);
  if (!EMAIL_RE.test(email)) fail("Email", "is not an email address");
  const socials = obj(input.socials);

  return {
    phone,
    phoneHours: bilingual(input.phoneHours, "Opening hours", 60),
    email,
    lineId: text(input.lineId, "LINE ID", 40, true),
    lineUrl: externalLink(input.lineUrl, "LINE add-friend link"),
    lineQrImage: link(input.lineQrImage, "LINE QR image"),
    socials: Object.fromEntries(
      SOCIAL_PLATFORMS.map((platform) => [platform, externalLink(socials[platform], platform)])
    ) as ContactContent["socials"],
  };
}

const ABOUT_ICONS: AboutValue["icon"][] = ["shield", "home", "wrench", "headset"];

/** Paragraphs per language; blank ones are dropped. */
function paragraphs(v: unknown, path: string): string[] {
  const items = (Array.isArray(v) ? v : [])
    .map((p, i) => text(p, `${path} paragraph ${i + 1}`, 1500))
    .filter(Boolean);
  if (items.length > 8) fail(path, "at most 8 paragraphs");
  return items;
}

function parseAbout(input: Obj): AboutContent {
  const story = obj(input.storyBody);
  const partnerEnabled = input.partnerEnabled === true;

  return {
    intro: bilingual(input.intro, "Intro", 500, true),
    stats: list(input.stats, "Stats", 6, blankRow, (row, p): AboutStat => ({
      value: text(row.value, `${p} value`, 12, true),
      label: bilingual(row.label, `${p} label`, 40, true),
    })),
    storyBody: {
      en: paragraphs(story.en, "Story (EN)"),
      th: paragraphs(story.th, "Story (TH)"),
    },
    storyImage: link(input.storyImage, "Story photo", true),
    partnerEnabled,
    partnerEyebrow: bilingual(input.partnerEyebrow, "Partner label", 40, partnerEnabled),
    partnerName: text(input.partnerName, "Partner name", 60, partnerEnabled),
    partnerStatus: bilingual(input.partnerStatus, "Partner status", 80, partnerEnabled),
    partnerBody: bilingual(input.partnerBody, "Partner text", 500, partnerEnabled),
    partnerLogo: link(input.partnerLogo, "Partner logo"),
    values: list(
      input.values,
      "What You Get",
      8,
      (row) => isBlank(bilingual(row.title, "", 1e6)) && isBlank(bilingual(row.body, "", 1e6)),
      (row, p): AboutValue => {
        const icon = row.icon as AboutValue["icon"];
        if (!ABOUT_ICONS.includes(icon)) fail(`${p} icon`, "unknown icon");
        return {
          icon,
          title: bilingual(row.title, `${p} title`, 60, true),
          body: bilingual(row.body, `${p} text`, 300, true),
        };
      }
    ),
    milestones: list(input.milestones, "Milestones", 20, blankRow, (row, p): Milestone => ({
      when: text(row.when, `${p} year`, 20, true),
      title: bilingual(row.title, `${p} title`, 80, true),
      body: bilingual(row.body, `${p} text`, 300, true),
    })),
    team: list(input.team, "Team", 24, blankRow, (row, p): TeamMember => {
      const photo = link(row.photo, `${p} photo`);
      return {
        name: text(row.name, `${p} name`, 80, true),
        role: bilingual(row.role, `${p} role`, 60, true),
        photo: photo || null,
      };
    }),
  };
}

const PRODUCT_ID_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;

function parseSeo(input: Obj): SeoContent {
  const products: Record<string, SeoOverride> = {};
  const raw = Object.entries(obj(input.products));
  if (raw.length > 500) fail("Products", "too many entries");
  for (const [id, value] of raw) {
    if (!PRODUCT_ID_RE.test(id)) fail("Products", `unknown product id "${id}"`);
    const entry = obj(value);
    const override = {
      title: bilingual(entry.title, `${id} title`, 120),
      description: bilingual(entry.description, `${id} description`, 320),
    };
    // Fully automatic products are not stored at all.
    if (!isBlank(override.title) || !isBlank(override.description)) products[id] = override;
  }

  return {
    siteTitle: bilingual(input.siteTitle, "Site title", 120, true),
    siteDescription: bilingual(input.siteDescription, "Site description", 320, true),
    shareImage: link(input.shareImage, "Share image", true),
    products,
  };
}

const PARSERS: { [S in ContentSection]: (input: Obj) => SiteContent[S] } = {
  announcement: parseAnnouncement,
  home: parseHome,
  about: parseAbout,
  contact: parseContact,
  seo: parseSeo,
};

/** The cleaned section, or a message naming the first field to fix. */
export function parseSection<S extends ContentSection>(
  section: S,
  body: unknown
): SiteContent[S] | string {
  try {
    return PARSERS[section](obj(body));
  } catch (e) {
    if (e instanceof Invalid) return e.message;
    throw e;
  }
}

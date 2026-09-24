import fs from "node:fs";
import path from "node:path";
import type { Payload, PayloadRequest } from "payload";
import sharp from "sharp";
import { CONTENT_SECTIONS, DEFAULT_CONTENT, type SiteContent } from "@/data/siteContent";

/**
 * First-run content for the CMS: copies what the site shows today
 * (data/siteContent.ts) into the Payload globals, and the images it uses from
 * /public into the media library. Without this, editors would open /cms to
 * empty forms and have to retype the whole site.
 *
 * Runs once, as a migration (payload/migrations/*_seed_content.ts). A global
 * that has already been published is left alone, so it is safe to run again.
 *
 * Before Payload, the site briefly had a hand-built content editor that stored
 * sections in public.site_content. Anything published there wins over the
 * built-in defaults, so switching CMS never silently discards an edit.
 */

/** Anything bigger is re-encoded as WebP — the old gallery posters were 4–9 MB PNGs. */
const REENCODE_ABOVE = 1.5 * 1024 * 1024;

/**
 * Map over items one at a time. Not in parallel: Payload keeps the file being
 * uploaded on the shared `req`, so parallel uploads overwrite each other (every
 * showcase image came out as the last one).
 */
async function inOrder<T, R>(items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (const item of items) out.push(await fn(item));
  return out;
}

export async function seedContent(payload: Payload, req?: PayloadRequest): Promise<void> {
  const uploaded = new Map<string, number | string>();

  /** Upload a /public image once; later uses of the same path reuse it. */
  async function media(src: string, alt: string): Promise<number | string | null> {
    if (!src) return null;
    const known = uploaded.get(src);
    if (known !== undefined) return known;
    if (!src.startsWith("/")) {
      payload.logger.warn(`seed: skipping external image ${src}`);
      return null;
    }
    const filePath = path.join(process.cwd(), "public", src);
    if (!fs.existsSync(filePath)) {
      payload.logger.warn(`seed: missing ${filePath}`);
      return null;
    }

    const original = fs.readFileSync(filePath);
    const base = path.basename(src).replace(/\.[^.]+$/, "");
    const file =
      original.length > REENCODE_ABOVE
        ? {
            data: await sharp(original).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer(),
            mimetype: "image/webp",
            name: `${base}.webp`,
          }
        : { data: original, mimetype: mimeOf(src), name: path.basename(src) };

    const doc = await payload.create({
      collection: "media",
      data: { alt },
      file: { ...file, size: file.data.length },
      req,
    });
    uploaded.set(src, doc.id);
    return doc.id;
  }

  async function seedGlobal(slug: "home" | "announcement" | "about" | "contact" | "seo", data: () => Promise<Record<string, unknown>>) {
    const existing = await payload.findGlobal({ slug, req, draft: false });
    if ((existing as { updatedAt?: string }).updatedAt) {
      payload.logger.info(`seed: ${slug} already published — left as is`);
      return;
    }
    await payload.updateGlobal({ slug, data: { ...(await data()), _status: "published" }, draft: false, req });
    payload.logger.info(`seed: ${slug} published from the built-in content`);
  }

  const d = await startingContent(payload);

  await seedGlobal("announcement", async () => ({
    enabled: d.announcement.enabled,
    messages: d.announcement.messages.map((message) => ({ message })),
  }));

  await seedGlobal("home", async () => ({
    heroHeadline: d.home.heroHeadline,
    heroAccent: d.home.heroAccent,
    heroSub: d.home.heroSub,
    heroVideos: d.home.heroVideos.map((url) => ({ url })),
    featureShowcase: await inOrder(d.home.featureShowcase, async (f) => ({
      image: await media(f.image, f.heading.en),
      heading: f.heading,
      body: f.body,
    })),
    videoGallery: await inOrder(d.home.videoGallery, async (v) => ({
      url: v.url,
      poster: v.poster ? await media(v.poster, v.title) : null,
      title: v.title,
      tag: v.tag ?? "",
      author: v.author ?? "",
    })),
    trustHeading: d.home.trustHeading,
    trustBody: d.home.trustBody,
    trustStats: d.home.trustStats,
  }));

  await seedGlobal("about", async () => ({
    intro: d.about.intro,
    stats: d.about.stats,
    storyBody: { en: d.about.storyBody.en.join("\n\n"), th: d.about.storyBody.th.join("\n\n") },
    storyImage: await media(d.about.storyImage, "FindMyRobo"),
    partnerEnabled: d.about.partnerEnabled,
    partnerEyebrow: d.about.partnerEyebrow,
    partnerName: d.about.partnerName,
    partnerStatus: d.about.partnerStatus,
    partnerBody: d.about.partnerBody,
    partnerLogo: d.about.partnerLogo ? await media(d.about.partnerLogo, d.about.partnerName) : null,
    values: d.about.values,
    milestones: d.about.milestones,
    team: await inOrder(d.about.team, async (m) => ({
      name: m.name,
      role: m.role,
      photo: m.photo ? await media(m.photo, m.name) : null,
    })),
  }));

  await seedGlobal("contact", async () => ({
    phone: d.contact.phone,
    phoneHours: d.contact.phoneHours,
    email: d.contact.email,
    lineId: d.contact.lineId,
    lineUrl: d.contact.lineUrl,
    lineQrImage: d.contact.lineQrImage ? await media(d.contact.lineQrImage, `LINE ${d.contact.lineId}`) : null,
    socials: d.contact.socials,
  }));

  await seedGlobal("seo", async () => ({
    siteTitle: d.seo.siteTitle,
    siteDescription: d.seo.siteDescription,
    shareImage: await media(d.seo.shareImage, "FindMyRobo"),
    products: [],
  }));
}

/** Built-in defaults, overlaid with anything published in the old editor. */
async function startingContent(payload: Payload): Promise<SiteContent> {
  const pool = (payload.db as unknown as { pool?: { query: (q: string) => Promise<{ rows: { section: string; content: unknown }[] }> } }).pool;
  if (!pool) return DEFAULT_CONTENT;
  try {
    const { rows } = await pool.query("select section, content from public.site_content");
    const stored = new Map(rows.map((r) => [r.section, r.content]));
    const merged = Object.fromEntries(
      CONTENT_SECTIONS.map((section) => {
        const row = stored.get(section);
        const usable = row && typeof row === "object" && !Array.isArray(row);
        if (usable) payload.logger.info(`seed: using ${section} as published in the previous editor`);
        return [section, usable ? { ...DEFAULT_CONTENT[section], ...(row as object) } : DEFAULT_CONTENT[section]];
      })
    );
    return merged as unknown as SiteContent;
  } catch {
    // No such table (a database that never had the old editor): defaults it is.
    return DEFAULT_CONTENT;
  }
}

function mimeOf(src: string): string {
  const ext = path.extname(src).toLowerCase();
  return (
    { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif" }[ext] ??
    "application/octet-stream"
  );
}

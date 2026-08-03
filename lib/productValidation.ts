import { categories } from "@/data/categories";
import {
  PAGE_BLOCK_TYPES,
  ROBOT_VARIANTS,
  SPEC_KEYS,
  type BoxItem,
  type FaqItem,
  type LocalizedText,
  type PageBlock,
  type Product,
  type ProductPage,
  type SpecGroup,
  type SpecKey,
} from "@/data/products";

/**
 * Shared server-side validation for the admin product create/update routes.
 * Returns the parsed Product, or a human-readable error string.
 */

export const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

/**
 * Mobile/symbol keyboards offer single-glyph unit characters like "㎡" (U+33A1,
 * one codepoint) instead of "m²". Barlow has no glyph for them, so the browser
 * falls back to another font for just that character and it looks out of place.
 * Expand the CJK "squared/cubed unit" range (mm…m³) to plain letters via NFKC,
 * then restore the superscript the ASCII form drops. Real text and URLs never
 * contain these codepoints, so this is safe to run on every field.
 */
const UNIT_GLYPHS = /[㎜-㎥]/g; // ㎜ mm … ㎥ m³ (CJK compat units)
const prettifyUnits = (s: string) =>
  s.replace(UNIT_GLYPHS, (ch) =>
    ch.normalize("NFKC").replace(/2$/, "²").replace(/3$/, "³")
  );

const asText = (v: unknown) =>
  typeof v === "string" ? prettifyUnits(v.trim()) : "";

/** Split textarea input into feature lines, dropping blanks. */
const asLines = (v: unknown) =>
  asText(v)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const URL_RE = /^(https?:\/\/|\/)[^\s]+$/i;

/** Localized text from the page builder: EN required, TH falls back to EN. */
function asLocalized(v: unknown): LocalizedText | null {
  if (typeof v !== "object" || v === null) return null;
  const en = asText((v as Record<string, unknown>).en);
  const th = asText((v as Record<string, unknown>).th);
  if (!en && !th) return null;
  return { en: en || th, th: th || en };
}

/**
 * Validate/sanitize the page-builder payload. Returns the cleaned page,
 * undefined when there is no page content at all, or an error string.
 * Incomplete entries (empty block, row without a label…) are dropped rather
 * than rejected so an admin can save a half-built page without fighting it.
 */
export function parsePage(raw: unknown): ProductPage | undefined | string {
  if (typeof raw !== "object" || raw === null) return undefined;
  const input = raw as Record<string, unknown>;
  const page: ProductPage = {};

  const videoUrl = asText(input.videoUrl);
  if (videoUrl) {
    if (!URL_RE.test(videoUrl)) return "Detail page: video URL must start with https:// or /";
    page.videoUrl = videoUrl;
    const caption = asLocalized(input.videoCaption);
    if (caption) page.videoCaption = caption;
  }

  if (Array.isArray(input.blocks)) {
    const blocks: PageBlock[] = [];
    for (const [i, item] of input.blocks.entries()) {
      if (typeof item !== "object" || item === null) continue;
      const b = item as Record<string, unknown>;
      const type = asText(b.type) as PageBlock["type"];
      if (!PAGE_BLOCK_TYPES.includes(type)) continue;
      const image = asText(b.image);
      if (image && !URL_RE.test(image)) {
        return `Detail page: block ${i + 1} image URL must start with https:// or /`;
      }
      const heading = asLocalized(b.heading);
      const body = asLocalized(b.body);

      if (type === "banner" && image) {
        blocks.push({ type, image });
      } else if (type === "feature" && heading && body) {
        blocks.push({ type, heading, body, ...(image ? { image } : {}) });
      } else if (type === "imageText" && image && body) {
        const imageSide = asText(b.imageSide) === "left" ? "left" : "right";
        blocks.push({ type, image, body, imageSide });
      } else if (type === "video") {
        const url = asText(b.url);
        if (!url) continue;
        if (!URL_RE.test(url)) {
          return `Detail page: block ${i + 1} video URL must start with https:// or /`;
        }
        const caption = asLocalized(b.caption);
        blocks.push({
          type,
          url,
          ...(heading ? { heading } : {}),
          ...(caption ? { caption } : {}),
        });
      } else if (type === "cardGrid" && Array.isArray(b.cards)) {
        const cards = [];
        for (const c of b.cards) {
          if (typeof c !== "object" || c === null) continue;
          const cardImage = asText((c as Record<string, unknown>).image);
          const caption = asLocalized((c as Record<string, unknown>).caption);
          if (!cardImage || !caption) continue;
          if (!URL_RE.test(cardImage)) {
            return `Detail page: a card image URL in block ${i + 1} must start with https:// or /`;
          }
          cards.push({ image: cardImage, caption });
        }
        if (cards.length > 0) {
          blocks.push({ type, cards, ...(heading ? { heading } : {}) });
        }
      } else if (type === "showcase" && Array.isArray(b.cards)) {
        const cards = [];
        for (const c of b.cards) {
          if (typeof c !== "object" || c === null) continue;
          const o = c as Record<string, unknown>;
          const cardImage = asText(o.image);
          const title = asLocalized(o.title);
          const body = asLocalized(o.body);
          if (!cardImage || !title || !body) continue;
          if (!URL_RE.test(cardImage)) {
            return `Detail page: a card image URL in block ${i + 1} must start with https:// or /`;
          }
          cards.push({ image: cardImage, title, body });
        }
        if (cards.length > 0) {
          blocks.push({ type, cards, ...(heading ? { heading } : {}) });
        }
      }
    }
    if (blocks.length > 0) page.blocks = blocks;
  }

  if (Array.isArray(input.specGroups)) {
    const groups: SpecGroup[] = [];
    for (const item of input.specGroups) {
      if (typeof item !== "object" || item === null) continue;
      const g = item as Record<string, unknown>;
      const title = asLocalized(g.title);
      if (!title || !Array.isArray(g.rows)) continue;
      const rows = [];
      for (const r of g.rows) {
        if (typeof r !== "object" || r === null) continue;
        const label = asLocalized((r as Record<string, unknown>).label);
        const value = asLocalized((r as Record<string, unknown>).value);
        if (label && value) rows.push({ label, value });
      }
      if (rows.length > 0) groups.push({ title, rows });
    }
    if (groups.length > 0) page.specGroups = groups;
  }

  if (Array.isArray(input.boxItems)) {
    const items: BoxItem[] = [];
    for (const [i, item] of input.boxItems.entries()) {
      if (typeof item !== "object" || item === null) continue;
      const o = item as Record<string, unknown>;
      const image = asText(o.image);
      const name = asLocalized(o.name);
      // Drop half-filled rows so an admin can save a partly-built list.
      if (!image || !name) continue;
      if (!URL_RE.test(image)) {
        return `Detail page: What's-in-the-box item ${i + 1} image URL must start with https:// or /`;
      }
      const qtyNum = Math.floor(Number(o.qty));
      const qty = Number.isFinite(qtyNum) && qtyNum > 0 ? qtyNum : 1;
      items.push({ image, name, qty });
    }
    if (items.length > 0) page.boxItems = items;
  }

  if (Array.isArray(input.faqs)) {
    const faqs: FaqItem[] = [];
    for (const item of input.faqs) {
      if (typeof item !== "object" || item === null) continue;
      const o = item as Record<string, unknown>;
      const question = asLocalized(o.question);
      const answer = asLocalized(o.answer);
      // Drop half-filled rows so an admin can save a partly-built FAQ list.
      if (question && answer) faqs.push({ question, answer });
    }
    if (faqs.length > 0) page.faqs = faqs;
  }

  return Object.keys(page).length > 0 ? page : undefined;
}

export function parseProduct(body: Record<string, unknown>): Product | string {
  const name = asText(body.name);
  if (!name) return "Product name is required";

  const price = Number(body.price);
  if (!Number.isFinite(price) || price <= 0) return "Price must be a positive number";

  const category = asText(body.category);
  if (!categories.some((c) => c.slug === category)) return "Unknown category";

  const variant = asText(body.variant);
  if (!ROBOT_VARIANTS.includes(variant as Product["variant"]))
    return "Unknown illustration variant";

  const taglineEn = asText(body.taglineEn);
  const taglineTh = asText(body.taglineTh);
  const descriptionEn = asText(body.descriptionEn);
  const descriptionTh = asText(body.descriptionTh);
  if (!taglineEn || !taglineTh) return "Tagline is required in both languages";
  if (!descriptionEn || !descriptionTh)
    return "Description is required in both languages";

  const featuresEn = asLines(body.featuresEn);
  const featuresTh = asLines(body.featuresTh);
  if (featuresEn.length === 0 || featuresTh.length === 0)
    return "At least one feature line is required in both languages";

  const specs: Partial<Record<SpecKey, string>> = {};
  for (const key of SPEC_KEYS) {
    const value = asText(body[`spec_${key}`]);
    if (value) specs[key] = value;
  }

  const id = asText(body.id) || slugify(name);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) return "Invalid product id";

  // optional product photo: https URL or a /public path
  const imageUrl = asText(body.imageUrl);
  if (imageUrl && !/^(https?:\/\/|\/)[^\s]+$/i.test(imageUrl)) {
    return "Image URL must start with https:// (or a /path inside the site)";
  }

  // optional separate image for the home feature card: https URL or /public path
  const homeImage = asText(body.homeImage);
  if (homeImage && !URL_RE.test(homeImage)) {
    return "Home image must be an https:// URL (or a /path inside the site)";
  }

  // optional hover-preview clip for the product card: https URL or /public path
  const hoverVideo = asText(body.hoverVideo);
  if (hoverVideo && !URL_RE.test(hoverVideo)) {
    return "Hover video must be an https:// URL (or a /path inside the site)";
  }

  // optional extra gallery photos, one URL per line
  const images = asLines(body.images).filter((url) => url !== imageUrl);
  if (images.some((url) => !URL_RE.test(url))) {
    return "Every gallery image must be an https:// URL (or a /path inside the site)";
  }
  if (images.length > 0 && !imageUrl) {
    return "Set a main image URL before adding gallery photos";
  }

  const page = parsePage(body.page);
  if (typeof page === "string") return page;

  // Visible unless explicitly turned off. The form pairs a hidden "false" input
  // with the checkbox so an unchecked box arrives as "false" rather than absent;
  // any other value (incl. a payload that omits it entirely) defaults to shown.
  const visible = body.visible !== "false" && body.visible !== false;

  // Optional warehouse SKU (Sokochan fulfilment). Capped to the column length;
  // blank stays undefined so services and un-mapped products carry no SKU.
  const sku = asText(body.sku).slice(0, 60);

  return {
    id,
    name,
    price: Math.round(price),
    category: category as Product["category"],
    variant: variant as Product["variant"],
    ...(imageUrl ? { imageUrl } : {}),
    ...(homeImage ? { homeImage } : {}),
    ...(images.length > 0 ? { images } : {}),
    ...(hoverVideo ? { hoverVideo } : {}),
    ...(body.preorder ? { preorder: true } : {}),
    visible,
    ...(sku ? { sku } : {}),
    specs,
    tagline: { en: taglineEn, th: taglineTh },
    description: { en: descriptionEn, th: descriptionTh },
    features: { en: featuresEn, th: featuresTh },
    ...(page ? { page } : {}),
  };
}

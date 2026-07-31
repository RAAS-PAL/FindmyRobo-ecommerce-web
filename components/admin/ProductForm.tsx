"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ImagePlus, LoaderCircle, Save } from "lucide-react";
import { categories } from "@/data/categories";
import {
  ROBOT_VARIANTS,
  SPEC_KEYS,
  type Product,
  type SpecKey,
} from "@/data/products";
import RobotIllustration from "@/components/ui/RobotIllustration";
import PageBuilder, {
  draftToPage,
  pageToDraft,
  type DraftPage,
} from "@/components/admin/PageBuilder";

const SPEC_LABEL_KEYS = {
  area: "specLabels.area",
  slope: "specLabels.slope",
  cuttingWidth: "specLabels.cuttingWidth",
  runtime: "specLabels.runtime",
  connectivity: "specLabels.connectivity",
  filtration: "specLabels.filtration",
} as const satisfies Record<SpecKey, string>;

const VARIANT_LABEL_KEYS = {
  luba: "variants.luba",
  mini: "variants.mini",
  pool: "variants.pool",
  install: "variants.install",
  demo: "variants.demo",
} as const satisfies Record<(typeof ROBOT_VARIANTS)[number], string>;

/** Clips already sitting in /public/videos, offered as quick picks in the
 *  hover-video field (a datalist). Any other URL/path can still be typed. */
const HOVER_VIDEO_OPTIONS = [
  "/videos/hero-banner-luba3.mp4",
  "/videos/hero-luba-mini.mp4",
  "/videos/luba-mini-1500.mp4",
];

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const inputClass =
  "min-h-[46px] w-full rounded-xl border border-forest-100 bg-surface px-4 text-[14px] text-content placeholder:text-ink-muted/50 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25";
const textareaClass =
  "w-full rounded-xl border border-forest-100 bg-surface px-4 py-3 text-[14px] leading-relaxed text-content placeholder:text-ink-muted/50 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25";
const labelClass = "mb-1.5 block text-[13px] font-semibold text-content";
const hintClass = "mt-1 text-[11.5px] text-ink-muted";
const uploadButtonClass =
  "mt-2 flex min-h-[42px] cursor-pointer items-center gap-2 rounded-full border border-forest-100 px-4 text-[13px] font-semibold text-content transition-colors hover:border-gold disabled:cursor-not-allowed disabled:opacity-50";

class UploadStatusError extends Error {
  constructor(readonly status: number) {
    super();
  }
}

/** Send one photo to the admin uploader; resolves to its public URL. */
async function uploadPhoto(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  if (!res.ok) throw new UploadStatusError(res.status);
  const json = await res.json();
  return json.url as string;
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-forest-100 bg-surface p-6 sm:p-8">
      <h2 className="font-display text-lg font-bold text-content">{title}</h2>
      {note && <p className="mt-1 text-[12.5px] text-ink-muted">{note}</p>}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

/**
 * Create + edit form for products. Without `initial` it POSTs a new product;
 * with `initial` it prefills every field and PUTs to the same id — the id is
 * immutable so storefront URLs survive renames.
 */
export default function ProductForm({ initial }: { initial?: Product }) {
  const t = useTranslations("admin.productForm");
  const tc = useTranslations("categories");
  const router = useRouter();
  const isEdit = initial !== undefined;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(initial?.name ?? "");
  // "image" is a UI-only choice: the real variant stays as the fallback art
  const [artChoice, setArtChoice] = useState<(typeof ROBOT_VARIANTS)[number] | "image">(
    initial?.imageUrl ? "image" : initial?.variant ?? "luba"
  );
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [hoverVideo, setHoverVideo] = useState(initial?.hoverVideo ?? "");
  // gallery URLs stay raw text so typing/pasting behaves; uploads append lines
  const [imagesText, setImagesText] = useState((initial?.images ?? []).join("\n"));
  const [uploading, setUploading] = useState<"main" | "gallery" | null>(null);
  const mainFileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);
  const fallbackVariant =
    artChoice === "image" ? initial?.variant ?? "luba" : artChoice;
  // rich detail page (video, content sections, spec table) — see PageBuilder
  const [pageDraft, setPageDraft] = useState<DraftPage>(() => pageToDraft(initial?.page));

  /** Upload the picked files, then hand their URLs to the matching field. */
  const handleFiles = async (
    target: "main" | "gallery",
    input: HTMLInputElement
  ) => {
    const files = Array.from(input.files ?? []);
    input.value = ""; // let the same file be re-picked after an error
    if (files.length === 0) return;

    setUploading(target);
    setError(null);
    try {
      const urls = await Promise.all(files.map(uploadPhoto));
      if (target === "main") {
        setImageUrl(urls[0]);
        // a multi-pick on the main field spills the rest into the gallery
        if (urls.length > 1) appendGallery(urls.slice(1));
      } else {
        appendGallery(urls);
      }
    } catch (e) {
      setError(
        e instanceof UploadStatusError
          ? t("errors.uploadStatus", { status: e.status })
          : t("errors.uploadFailed")
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setUploading(null);
    }
  };

  const appendGallery = (urls: string[]) =>
    setImagesText((prev) => [prev.trim(), ...urls].filter(Boolean).join("\n"));

  const galleryUrls = imagesText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const data: Record<string, unknown> = Object.fromEntries(
      new FormData(e.currentTarget).entries()
    );
    data.page = draftToPage(pageDraft);
    try {
      const res = await fetch(
        isEdit ? `/api/admin/products/${initial.id}` : "/api/admin/products",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (res.ok) {
        router.push("/admin");
        router.refresh();
        return;
      }
      setError(t("errors.saveStatus", { status: res.status }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(t("errors.serverUnavailable"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700"
        >
          {error}
        </p>
      )}

      <Section title={t("sections.basics")}>
        <div className="sm:col-span-2">
          <label htmlFor="name" className={labelClass}>
            {t("fields.productName")}
          </label>
          <input
            id="name"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("placeholders.productName")}
            className={inputClass}
          />
          {isEdit ? (
            <p className={hintClass}>
              {t("hints.editUrl", { id: initial.id })}
            </p>
          ) : (
            name && (
              <p className={hintClass}>
                {t("hints.createUrl", { slug: slugify(name) })}
              </p>
            )
          )}
        </div>
        <div>
          <label htmlFor="price" className={labelClass}>
            {t("fields.price")}
          </label>
          <input
            id="price"
            name="price"
            type="number"
            required
            min={1}
            step={1}
            defaultValue={initial?.price}
            placeholder={t("placeholders.price")}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="category" className={labelClass}>
            {t("fields.category")}
          </label>
          <select
            id="category"
            name="category"
            defaultValue={initial?.category}
            className={inputClass}
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {tc(`${c.slug}.name`)}
                {!c.available ? t("fields.comingSoonSuffix") : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sku" className={labelClass}>
            {t("fields.sku")}
          </label>
          <input
            id="sku"
            name="sku"
            maxLength={60}
            defaultValue={initial?.sku ?? ""}
            placeholder={t("placeholders.sku")}
            className={`${inputClass} font-mono`}
          />
          <p className={hintClass}>{t("hints.sku")}</p>
        </div>
        <div>
          <label htmlFor="artChoice" className={labelClass}>
            {t("fields.productVisual")}
          </label>
          {/* the submitted variant is always a real illustration (the fallback
              when an image URL is set or later removed) */}
          <input type="hidden" name="variant" value={fallbackVariant} />
          <div className="flex items-center gap-4">
            <select
              id="artChoice"
              value={artChoice}
              onChange={(e) => setArtChoice(e.target.value as typeof artChoice)}
              className={inputClass}
            >
              {ROBOT_VARIANTS.map((v) => (
                <option key={v} value={v}>
                  {t(VARIANT_LABEL_KEYS[v])}
                </option>
              ))}
              <option value="image">{t("fields.customImage")}</option>
            </select>
            <span className="flex h-14 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-forest via-forest-800 to-forest-950 p-1.5">
              {artChoice === "image" && imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={t("aria.productPreview")}
                  className="h-full w-auto object-contain"
                />
              ) : (
                <RobotIllustration variant={fallbackVariant} className="h-full w-auto" />
              )}
            </span>
          </div>
          {artChoice === "image" ? (
            <div className="mt-3">
              <label htmlFor="imageUrl" className={labelClass}>
                {t("fields.imageUrl")}
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder={t("placeholders.imageUrl")}
                className={inputClass}
              />
              <input
                ref={mainFileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                multiple
                hidden
                onChange={(e) => handleFiles("main", e.currentTarget)}
              />
              <button
                type="button"
                disabled={uploading !== null}
                onClick={() => mainFileRef.current?.click()}
                className={uploadButtonClass}
              >
                {uploading === "main" ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ImagePlus className="h-4 w-4" aria-hidden="true" />
                )}
                {uploading === "main"
                  ? t("actions.uploading")
                  : t("actions.uploadPhoto")}
              </button>
              <p className={hintClass}>
                {t("hints.imageUpload")}
              </p>
              <label htmlFor="images" className={`${labelClass} mt-4`}>
                {t("fields.galleryPhotos")}
              </label>
              <textarea
                id="images"
                name="images"
                rows={4}
                value={imagesText}
                onChange={(e) => setImagesText(e.target.value)}
                placeholder={t("placeholders.galleryUrls")}
                className={textareaClass}
              />
              <input
                ref={galleryFileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                multiple
                hidden
                onChange={(e) => handleFiles("gallery", e.currentTarget)}
              />
              <button
                type="button"
                disabled={uploading !== null}
                onClick={() => galleryFileRef.current?.click()}
                className={uploadButtonClass}
              >
                {uploading === "gallery" ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ImagePlus className="h-4 w-4" aria-hidden="true" />
                )}
                {uploading === "gallery"
                  ? t("actions.uploading")
                  : t("actions.uploadGalleryPhotos")}
              </button>
              <p className={hintClass}>
                {t("hints.gallery")}
              </p>
              {galleryUrls.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {galleryUrls.map((url, i) => (
                    <li
                      key={`${url}-${i}`}
                      className="flex h-14 w-16 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-forest via-forest-800 to-forest-950 p-1"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={t("aria.galleryPhoto", { number: i + 1 })}
                        className="h-full w-auto object-contain"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className={hintClass}>{t("hints.placeholderArt")}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="hoverVideo" className={labelClass}>
            {t("fields.hoverVideo")}
          </label>
          <input
            id="hoverVideo"
            name="hoverVideo"
            type="text"
            list="hoverVideoOptions"
            value={hoverVideo}
            onChange={(e) => setHoverVideo(e.target.value)}
            placeholder={t("placeholders.hoverVideo")}
            className={inputClass}
          />
          <datalist id="hoverVideoOptions">
            {HOVER_VIDEO_OPTIONS.map((src) => (
              <option key={src} value={src} />
            ))}
          </datalist>
          <p className={hintClass}>{t("hints.hoverVideo")}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <input
            id="preorder"
            name="preorder"
            type="checkbox"
            value="1"
            defaultChecked={!!initial?.preorder}
            className="h-4.5 w-4.5 rounded border-forest-100 accent-[#f5c842]"
          />
          <label htmlFor="preorder" className="text-[13.5px] font-medium text-content">
            {t("fields.preorder")}
          </label>
        </div>
        <div className="sm:col-span-2">
          {/* hidden 'false' pairs with the checkbox so an unchecked box submits
              as false rather than being omitted (see parseProduct) */}
          <input type="hidden" name="visible" value="false" />
          <label className="flex items-center gap-2.5">
            <input
              name="visible"
              type="checkbox"
              value="true"
              defaultChecked={initial?.visible ?? true}
              className="h-4.5 w-4.5 rounded border-forest-100 accent-[#f5c842]"
            />
            <span className="text-[13.5px] font-medium text-content">
              {t("fields.visible")}
            </span>
          </label>
          <p className={hintClass}>{t("hints.visible")}</p>
        </div>
      </Section>

      <Section title={t("sections.marketingEnglish")}>
        <div>
          <label htmlFor="taglineEn" className={labelClass}>
            {t("fields.englishTagline")}
          </label>
          <input
            id="taglineEn"
            name="taglineEn"
            required
            defaultValue={initial?.tagline.en}
            placeholder={t("placeholders.englishTagline")}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="descriptionEn" className={labelClass}>
            {t("fields.englishDescription")}
          </label>
          <textarea
            id="descriptionEn"
            name="descriptionEn"
            required
            rows={3}
            defaultValue={initial?.description.en}
            className={textareaClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="featuresEn" className={labelClass}>
            {t("fields.englishFeatureBullets")}
          </label>
          <textarea
            id="featuresEn"
            name="featuresEn"
            required
            rows={4}
            defaultValue={initial?.features.en.join("\n")}
            placeholder={t("placeholders.englishFeatureBullets")}
            className={textareaClass}
          />
        </div>
      </Section>

      <Section title={t("sections.marketingThai")}>
        <div>
          <label htmlFor="taglineTh" className={labelClass}>
            {t("fields.thaiTagline")}
          </label>
          <input
            id="taglineTh"
            name="taglineTh"
            required
            defaultValue={initial?.tagline.th}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="descriptionTh" className={labelClass}>
            {t("fields.thaiDescription")}
          </label>
          <textarea
            id="descriptionTh"
            name="descriptionTh"
            required
            rows={3}
            defaultValue={initial?.description.th}
            className={textareaClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="featuresTh" className={labelClass}>
            {t("fields.thaiFeatureBullets")}
          </label>
          <textarea
            id="featuresTh"
            name="featuresTh"
            required
            rows={4}
            defaultValue={initial?.features.th.join("\n")}
            className={textareaClass}
          />
        </div>
      </Section>

      <Section
        title={t("sections.quickSpecs")}
        note={t("sections.quickSpecsNote")}
      >
        {SPEC_KEYS.map((key) => (
          <div key={key}>
            <label htmlFor={`spec_${key}`} className={labelClass}>
              {t(SPEC_LABEL_KEYS[key])}
            </label>
            <input
              id={`spec_${key}`}
              name={`spec_${key}`}
              defaultValue={initial?.specs[key] ?? ""}
              className={inputClass}
            />
          </div>
        ))}
      </Section>

      <section className="rounded-2xl border border-forest-100 bg-surface p-6 sm:p-8">
        <h2 className="font-display text-lg font-bold text-content">
          {t("sections.detailBuilder")}
        </h2>
        <p className="mt-1 text-[12.5px] text-ink-muted">
          {t("sections.detailBuilderDescription")}
        </p>
        <div className="mt-6">
          <PageBuilder draft={pageDraft} onChange={setPageDraft} />
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="flex min-h-[48px] cursor-pointer items-center rounded-full border border-forest-100 px-6 text-[13.5px] font-semibold text-content transition-colors hover:border-gold"
        >
          {t("actions.cancel")}
        </button>
        <button
          type="submit"
          disabled={busy}
          className="flex min-h-[48px] cursor-pointer items-center gap-2 rounded-full bg-gold px-8 text-[14px] font-bold text-forest-950 transition-all duration-300 hover:shadow-[0_0_28px_-4px_rgba(245,200,66,0.65)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="h-4 w-4" aria-hidden="true" />
          )}
          {isEdit ? t("actions.saveChanges") : t("actions.saveProduct")}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

const SPEC_LABELS: Record<SpecKey, string> = {
  area: "Coverage area (e.g. 3,000 m²)",
  slope: "Max slope (e.g. 80% (38°))",
  cuttingWidth: "Cutting width (e.g. 400 mm)",
  runtime: "Runtime (e.g. 180 min)",
  connectivity: "Navigation & connectivity",
  filtration: "Filtration (pool robots)",
};

const VARIANT_LABELS: Record<(typeof ROBOT_VARIANTS)[number], string> = {
  luba: "Large mower",
  mini: "Compact mower",
  pool: "Pool robot",
  install: "Installation service",
  demo: "Demo booking",
};

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

/** Send one photo to the admin uploader; resolves to its public URL. */
async function uploadPhoto(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error ?? `Upload failed (${res.status})`);
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
      setError(e instanceof Error ? e.message : "Upload failed");
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
      const body = await res.json().catch(() => null);
      setError(body?.error ?? `Save failed (${res.status})`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Could not reach the server.");
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

      <Section title="Basics">
        <div className="sm:col-span-2">
          <label htmlFor="name" className={labelClass}>
            Product name
          </label>
          <input
            id="name"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="MAMMOTION LUBA 3 AWD 3000"
            className={inputClass}
          />
          {isEdit ? (
            <p className={hintClass}>
              URL: /products/<span className="font-mono">{initial.id}</span>{" "}
              (fixed — links keep working after edits)
            </p>
          ) : (
            name && (
              <p className={hintClass}>
                URL: /products/<span className="font-mono">{slugify(name)}</span>
              </p>
            )
          )}
        </div>
        <div>
          <label htmlFor="price" className={labelClass}>
            Price (฿, THB)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            required
            min={1}
            step={1}
            defaultValue={initial?.price}
            placeholder="159000"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={initial?.category}
            className={inputClass}
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
                {!c.available ? " (coming soon)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="artChoice" className={labelClass}>
            Product visual
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
                  {VARIANT_LABELS[v]}
                </option>
              ))}
              <option value="image">Custom image (URL)</option>
            </select>
            <span className="flex h-14 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-forest via-forest-800 to-forest-950 p-1.5">
              {artChoice === "image" && imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Product preview"
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
                Image URL
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/robot.jpg"
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
                {uploading === "main" ? "Uploading…" : "Upload photo"}
              </button>
              <p className={hintClass}>
                Upload a photo, or paste a direct image link (https://…). The
                illustration stays as the fallback if the image fails to load.
                Pick several at once and the extras go to the gallery below.
              </p>
              <label htmlFor="images" className={`${labelClass} mt-4`}>
                Gallery photos — one URL per line (optional)
              </label>
              <textarea
                id="images"
                name="images"
                rows={4}
                value={imagesText}
                onChange={(e) => setImagesText(e.target.value)}
                placeholder={
                  "https://example.com/robot-side.jpg\nhttps://example.com/robot-top.jpg"
                }
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
                {uploading === "gallery" ? "Uploading…" : "Upload gallery photos"}
              </button>
              <p className={hintClass}>
                Extra angles for the product page gallery, shown after the main
                image, in this order. Leave empty for a single photo.
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
                        alt={`Gallery photo ${i + 1}`}
                        className="h-full w-auto object-contain"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className={hintClass}>Placeholder art until real product photos land.</p>
          )}
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
            Preorder (not in stock yet)
          </label>
        </div>
      </Section>

      <Section title="Marketing copy — English">
        <div>
          <label htmlFor="taglineEn" className={labelClass}>
            Tagline
          </label>
          <input
            id="taglineEn"
            name="taglineEn"
            required
            defaultValue={initial?.tagline.en}
            placeholder="All-wheel drive precision for large Thai gardens"
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="descriptionEn" className={labelClass}>
            Description
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
            Feature bullets — one per line
          </label>
          <textarea
            id="featuresEn"
            name="featuresEn"
            required
            rows={4}
            defaultValue={initial?.features.en.join("\n")}
            placeholder={"AWD climbs slopes up to 80%\nNo boundary wire needed"}
            className={textareaClass}
          />
        </div>
      </Section>

      <Section title="Marketing copy — Thai">
        <div>
          <label htmlFor="taglineTh" className={labelClass}>
            Tagline (ภาษาไทย)
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
            Description (ภาษาไทย)
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
            Feature bullets (ภาษาไทย) — one per line
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
        title="Quick specs — not shown on the product page"
        note="Specs shoppers see come from the Detailed specification table below. Coverage area is still used to pick which installation package is offered at checkout, so keep it filled in for robots."
      >
        {SPEC_KEYS.map((key) => (
          <div key={key}>
            <label htmlFor={`spec_${key}`} className={labelClass}>
              {SPEC_LABELS[key]}
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
          Detail page builder
        </h2>
        <p className="mt-1 text-[12.5px] text-ink-muted">
          Everything below is optional and per-robot: an intro video, rich
          content sections, and a detailed spec table shown on the product page.
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
          Cancel
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
          {isEdit ? "Save changes" : "Save product"}
        </button>
      </div>
    </form>
  );
}

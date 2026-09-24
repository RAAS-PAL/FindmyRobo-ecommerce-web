"use client";

/* eslint-disable @next/next/no-img-element -- previews of arbitrary media URLs */

import { useEffect, useState } from "react";
import { useFormFields, useRowLabel, useTranslation } from "@payloadcms/ui";
import type { CatalogProduct } from "./catalog";

/**
 * How the SEO text will look where it is actually read: a Google result and a
 * LINE / Facebook link card, updating as you type. Search text is not visible
 * on the page itself, so these stand in for Live Preview on the SEO global.
 *
 * Inline styles on purpose: the CMS runs on Payload's own stylesheet, not the
 * site's Tailwind. The Google card truncates by width at Google's ~600px, so
 * a title that fits here fits there.
 */

const SITE_HOST = "www.findmyrobo.com";
type Lang = "th" | "en";

/** The public URL of a media-library image, from the id the form holds. */
function useMediaUrl(value: unknown): string | null {
  const raw = value && typeof value === "object" ? (value as { id?: unknown }).id : value;
  const id = raw === null || raw === undefined || raw === "" ? null : String(raw);
  // The last lookup, tagged with the id it answers — so a stale answer for a
  // previously picked image is never shown for the current one.
  const [found, setFound] = useState<{ id: string; url: string | null } | null>(null);
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch(`/cms-api/media/${encodeURIComponent(id)}?depth=0`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((doc) => !cancelled && setFound({ id, url: doc?.url ?? null }))
      .catch(() => !cancelled && setFound({ id, url: null }));
    return () => {
      cancelled = true;
    };
  }, [id]);
  return id && found?.id === id ? found.url : null;
}

/** Read several form values by path at once. */
function useValues(paths: Record<string, string>): Record<string, unknown> {
  return useFormFields(([fields]) =>
    Object.fromEntries(Object.entries(paths).map(([k, p]) => [k, fields[p]?.value]))
  );
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

function LangToggle({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div style={{ display: "inline-flex", border: "1px solid var(--theme-elevation-150)", borderRadius: 999, padding: 2 }}>
      {(["th", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          aria-pressed={lang === l}
          style={{
            border: 0,
            borderRadius: 999,
            padding: "4px 12px",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 12,
            background: lang === l ? "var(--theme-elevation-800)" : "transparent",
            color: lang === l ? "var(--theme-elevation-0)" : "var(--theme-elevation-500)",
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function Cards({ title, description, image, path }: { title: string; description: string; image: string | null; path: string }) {
  const breadcrumb = [SITE_HOST, ...path.split("/").filter(Boolean)].join(" › ");
  const clamp = (lines: number): React.CSSProperties => ({
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  });
  return (
    <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", alignItems: "start" }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e5e7eb", fontFamily: "Arial, sans-serif" }}>
        <div style={{ maxWidth: 600 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ width: 28, height: 28, borderRadius: 999, background: "#f1f3f4", border: "1px solid #dadce0", display: "grid", placeItems: "center" }}>
              <img src="/icon.png" alt="" style={{ width: 16, height: 16 }} />
            </span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 14, color: "#202124", lineHeight: 1.2 }}>FindMyRobo</span>
              <span style={{ display: "block", fontSize: 12, color: "#4d5156", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                https://{breadcrumb}
              </span>
            </span>
          </div>
          <div style={{ marginTop: 6, fontSize: 20, lineHeight: 1.3, color: "#1a0dab", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {title}
          </div>
          <div style={{ marginTop: 4, fontSize: 14, lineHeight: 1.58, color: "#4d5156", ...clamp(2) }}>{description}</div>
        </div>
      </div>
      <div style={{ maxWidth: 500, borderRadius: 12, overflow: "hidden", border: "1px solid #dadde1", background: "#fff", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <div style={{ aspectRatio: "1.91 / 1", background: "#f0f2f5" }}>
          {image && <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
        </div>
        <div style={{ padding: "10px 12px", background: "#f0f2f5", borderTop: "1px solid #dadde1" }}>
          <div style={{ fontSize: 12, color: "#65676b", textTransform: "uppercase" }}>{SITE_HOST}</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#050505", lineHeight: 1.3, marginTop: 2, ...clamp(2) }}>{title}</div>
          <div style={{ fontSize: 14, color: "#65676b", marginTop: 2, ...clamp(1) }}>{description}</div>
        </div>
      </div>
    </div>
  );
}

function PreviewFrame({ lang, setLang, children }: { lang: Lang; setLang: (l: Lang) => void; children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const th = i18n.language === "th";
  return (
    <div style={{ margin: "8px 0 24px", padding: 16, borderRadius: 12, background: "var(--theme-elevation-50)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 12 }}>
        <strong style={{ fontSize: 13 }}>{th ? "ตัวอย่างใน Google และเมื่อแชร์" : "Preview in Google and when shared"}</strong>
        <LangToggle lang={lang} onChange={setLang} />
      </div>
      {children}
    </div>
  );
}

/** SEO → Whole site. */
export function SiteSeoPreview() {
  const [lang, setLang] = useState<Lang>("th");
  const v = useValues({
    titleEn: "siteTitle.en",
    titleTh: "siteTitle.th",
    descEn: "siteDescription.en",
    descTh: "siteDescription.th",
    image: "shareImage",
  });
  const image = useMediaUrl(v.image);
  const title = str(lang === "th" ? v.titleTh : v.titleEn) || str(v.titleEn);
  const description = str(lang === "th" ? v.descTh : v.descEn) || str(v.descEn);
  return (
    <PreviewFrame lang={lang} setLang={setLang}>
      <Cards title={title} description={description} image={image} path={lang === "th" ? "/" : "/en"} />
    </PreviewFrame>
  );
}

/** SEO → Products: one row's result, falling back to the automatic values. */
export function ProductSeoPreviewClient({ path, catalog }: { path: string; catalog: CatalogProduct[] }) {
  const [lang, setLang] = useState<Lang>("th");
  const row = path.replace(/productPreview$/, ""); // e.g. "products.0."
  const v = useValues({
    productId: `${row}productId`,
    titleEn: `${row}title.en`,
    titleTh: `${row}title.th`,
    descEn: `${row}description.en`,
    descTh: `${row}description.th`,
  });
  const siteShare = useFormFields(([fields]) => fields.shareImage?.value);
  const siteShareUrl = useMediaUrl(siteShare);
  const product = catalog.find((p) => p.id === v.productId);
  if (!product) return null;

  const title = str(lang === "th" ? v.titleTh : v.titleEn) || `${product.name} — FindMyRobo`;
  const description = str(lang === "th" ? v.descTh : v.descEn) || product.autoDescription[lang];
  const productPath = `${lang === "th" ? "" : "/en"}/products/${product.id}`;
  return (
    <PreviewFrame lang={lang} setLang={setLang}>
      <Cards title={title} description={description} image={product.image ?? siteShareUrl} path={productPath} />
    </PreviewFrame>
  );
}

/** Array row header: which product the row is for. */
export function ProductRowLabel() {
  const { data, rowNumber } = useRowLabel<{ productId?: string }>();
  return <span>{data?.productId || `#${(rowNumber ?? 0) + 1}`}</span>;
}

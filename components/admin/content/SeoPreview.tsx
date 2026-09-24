"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import type { SeoContent } from "@/data/siteContent";
import { ToggleButton, storefrontPath } from "./LivePreview";
import type { SeoProduct } from "./SeoEditor";

const SITE_HOST = "www.findmyrobo.com";

/**
 * How the draft SEO text will look where it is actually read: a Google
 * result and a LINE / Facebook link card. These are not on the page itself,
 * so the SEO editor gets this mock-up instead of the framed storefront.
 *
 * The Google card truncates the way Google does — by width, not by a
 * character count — at Google's ~600px measure, narrowed if the pane is
 * smaller. So it errs early: a title that fits here also fits on Google.
 */
export default function SeoPreview({
  value,
  products,
  selected,
  onSelect,
}: {
  value: SeoContent;
  products: SeoProduct[];
  /** Product id, or null for the homepage. */
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const t = useTranslations("admin.content.preview");
  const selectId = useId();
  const [lang, setLang] = useState<"th" | "en">("th");

  const product = products.find((p) => p.id === selected) ?? null;
  const override = product ? value.products[product.id] : undefined;
  const path = storefrontPath(product ? `/products/${product.id}` : "/", lang);
  const title = product
    ? override?.title[lang] || `${product.name} — FindMyRobo`
    : value.siteTitle[lang] || value.siteTitle.en;
  const description = product
    ? override?.description[lang] || product.autoDescription[lang]
    : value.siteDescription[lang] || value.siteDescription.en;
  const image = product?.image || value.shareImage;
  const breadcrumb = [SITE_HOST, ...path.split("/").filter(Boolean)].join(" › ");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-forest-100 px-3 py-2">
        <label htmlFor={selectId} className="sr-only">
          {t("seoPage")}
        </label>
        <select
          id={selectId}
          value={selected ?? ""}
          onChange={(e) => onSelect(e.target.value || null)}
          className="min-h-[34px] max-w-[60%] cursor-pointer rounded-full border border-forest-100 bg-surface px-3 text-[12.5px] font-semibold text-content"
        >
          <option value="">{t("seoHomepage")}</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1 rounded-full border border-forest-100 p-0.5">
          {(["th", "en"] as const).map((l) => (
            <ToggleButton
              key={l}
              active={lang === l}
              label={l === "th" ? t("thai") : t("english")}
              onClick={() => setLang(l)}
            >
              {l.toUpperCase()}
            </ToggleButton>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto bg-cloud p-5">
        {/* Google result — fixed 600px measure, Google's own fonts and colours */}
        <section>
          <h3 className="mb-2 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-ink-muted">
            {t("seoGoogle")}
          </h3>
          <div className="overflow-x-auto rounded-2xl bg-white p-5 shadow-sm">
            <div className="w-[600px] max-w-full" style={{ fontFamily: "Arial, sans-serif" }}>
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#dadce0] bg-[#f1f3f4]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icon.png" alt="" className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] leading-tight text-[#202124]">FindMyRobo</span>
                  <span className="block truncate text-[12px] leading-tight text-[#4d5156]">
                    https://{breadcrumb}
                  </span>
                </span>
              </div>
              <p className="mt-1.5 truncate text-[20px] leading-[1.3] text-[#1a0dab]">{title}</p>
              <p className="mt-1 line-clamp-2 text-[14px] leading-[1.58] text-[#4d5156]">{description}</p>
            </div>
          </div>
        </section>

        {/* LINE / Facebook link card */}
        <section>
          <h3 className="mb-2 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-ink-muted">
            {t("seoShare")}
          </h3>
          <div className="max-w-[500px] overflow-hidden rounded-2xl border border-[#dadde1] bg-white shadow-sm">
            <div className="aspect-[1.91/1] bg-[#f0f2f5]">
              {image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div
              className="border-t border-[#dadde1] bg-[#f0f2f5] px-3 py-2.5"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            >
              <p className="text-[12px] uppercase text-[#65676b]">{SITE_HOST}</p>
              <p className="mt-0.5 line-clamp-2 text-[16px] font-semibold leading-snug text-[#050505]">{title}</p>
              <p className="mt-0.5 line-clamp-1 text-[14px] text-[#65676b]">{description}</p>
            </div>
          </div>
          {product && !product.image && (
            <p className="mt-2 text-[11.5px] text-ink-muted">{t("seoNoProductImage")}</p>
          )}
        </section>
      </div>
    </div>
  );
}

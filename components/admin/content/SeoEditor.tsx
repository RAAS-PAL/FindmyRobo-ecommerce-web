"use client";

import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import type { Bilingual, SeoContent, SeoOverride } from "@/data/siteContent";
import EditorShell, { useContentEditor, type EditorMeta } from "./EditorShell";
import { BilingualField, emptyBilingual, ImageField, Panel } from "./fields";

/** What a product's search result shows when nobody has overridden it. */
export interface SeoProduct {
  id: string;
  name: string;
  /** Snippet generated from the product description (lib/seo.ts metaDescription). */
  autoDescription: Bilingual;
  hidden: boolean;
}

const emptyOverride = (): SeoOverride => ({ title: emptyBilingual(), description: emptyBilingual() });
const isOverridden = (o: SeoOverride | undefined) =>
  !!o && !!(o.title.en || o.title.th || o.description.en || o.description.th);

/**
 * Search and share text. The site title/description cover the homepage and any
 * page without its own; each product can override its own title and snippet,
 * and a blank field keeps the automatic one (shown as the placeholder, so
 * marketing can see what they would be replacing).
 */
export default function SeoEditor({
  initial,
  meta,
  products,
}: {
  initial: SeoContent;
  meta: EditorMeta;
  products: SeoProduct[];
}) {
  const t = useTranslations("admin.content.seo");
  const editor = useContentEditor("seo", initial);
  const { value, set } = editor;

  const setProduct = (id: string, override: SeoOverride) =>
    set("products", { ...value.products, [id]: override });

  return (
    <EditorShell editor={editor} meta={meta} viewHref={null}>
      <Panel title={t("site.title")} note={t("site.note")}>
        <BilingualField
          label={t("site.siteTitle")}
          value={value.siteTitle}
          onChange={(v) => set("siteTitle", v)}
          required
          maxLength={120}
          recommended={60}
        />
        <BilingualField
          label={t("site.description")}
          value={value.siteDescription}
          onChange={(v) => set("siteDescription", v)}
          multiline
          required
          maxLength={320}
          recommended={160}
        />
        <ImageField
          label={t("site.shareImage")}
          value={value.shareImage}
          onChange={(v) => set("shareImage", v)}
          required
          hint={t("site.shareImageHint")}
        />
      </Panel>

      <Panel title={t("products.title")} note={t("products.note")}>
        {products.length === 0 && <p className="text-[13px] text-ink-muted">{t("products.empty")}</p>}
        <div className="space-y-2">
          {products.map((product) => {
            const override = value.products[product.id] ?? emptyOverride();
            const autoTitle = `${product.name} — FindMyRobo`;
            return (
              <details
                key={product.id}
                className="group rounded-xl border border-forest-100 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px] font-semibold text-content">
                      {product.name}
                    </span>
                    <span className="block font-mono text-[11px] text-ink-muted">{product.id}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {product.hidden && (
                      <span className="rounded-full border border-ink-muted/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                        {t("products.hidden")}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                        isOverridden(value.products[product.id])
                          ? "bg-gold/15 text-gold-600"
                          : "bg-forest-100/60 text-ink-muted"
                      }`}
                    >
                      {isOverridden(value.products[product.id]) ? t("products.custom") : t("products.auto")}
                    </span>
                    <ChevronDown
                      className="h-4 w-4 text-ink-muted transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </span>
                </summary>
                <div className="space-y-5 border-t border-forest-100 p-4">
                  <BilingualField
                    label={t("products.productTitle")}
                    value={override.title}
                    onChange={(title) => setProduct(product.id, { ...override, title })}
                    maxLength={120}
                    recommended={60}
                    placeholder={{ en: autoTitle, th: autoTitle }}
                  />
                  <BilingualField
                    label={t("products.description")}
                    value={override.description}
                    onChange={(description) => setProduct(product.id, { ...override, description })}
                    multiline
                    maxLength={320}
                    recommended={160}
                    placeholder={product.autoDescription}
                    hint={t("products.blankHint")}
                  />
                </div>
              </details>
            );
          })}
        </div>
      </Panel>
    </EditorShell>
  );
}

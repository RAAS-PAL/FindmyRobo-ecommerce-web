"use client";

import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import {
  ANATOMY_MODELS,
  MAX_SHOWCASE_FIGURES,
  type AnatomyModel,
  type LocalizedText,
  type PageBlock,
  type ProductPage,
} from "@/data/products";
import { useConfirm } from "@/components/admin/ConfirmProvider";

/**
 * Admin editor for a product's rich detail page: intro video, ordered content
 * blocks (banner / feature / card grid / image+text / video), and the grouped
 * specification table. Fully controlled — the parent form owns the state and
 * submits it as the `page` field of the product payload.
 *
 * Draft-friendly by design: rows/blocks left half-empty are dropped by the
 * server-side sanitizer (lib/productValidation.ts parsePage) instead of
 * blocking the save.
 */

/* Editable draft shapes: every field always present so inputs stay controlled */
export interface DraftCard {
  image: string;
  captionEn: string;
  captionTh: string;
  titleEn: string;
  titleTh: string;
  bodyEn: string;
  bodyTh: string;
}
export interface DraftBlock {
  type: PageBlock["type"];
  image: string;
  url: string;
  imageSide: "left" | "right";
  headingEn: string;
  headingTh: string;
  bodyEn: string;
  bodyTh: string;
  captionEn: string;
  captionTh: string;
  cards: DraftCard[];
  /** anatomy only: which model's parts diagram; "" = none */
  model: AnatomyModel | "";
  /** feature only: small line above the heading (full-screen page) */
  eyebrowEn: string;
  eyebrowTh: string;
}
export interface DraftFigure {
  value: string;
  labelEn: string;
  labelTh: string;
}
export interface DraftColor {
  labelEn: string;
  labelTh: string;
  swatch: string;
  image: string;
}
/** The full-screen page's own fields (ProductPage.showcase). */
export interface DraftShowcase {
  enabled: boolean;
  eyebrowEn: string;
  eyebrowTh: string;
  heroImage: string;
  figures: DraftFigure[];
  colors: DraftColor[];
}
export interface DraftSpecRow {
  labelEn: string;
  labelTh: string;
  valueEn: string;
  valueTh: string;
}
export interface DraftSpecGroup {
  titleEn: string;
  titleTh: string;
  rows: DraftSpecRow[];
}
export interface DraftBoxItem {
  image: string;
  nameEn: string;
  nameTh: string;
  qty: string;
}
export interface DraftFaq {
  questionEn: string;
  questionTh: string;
  answerEn: string;
  answerTh: string;
}
export interface DraftPage {
  showcase: DraftShowcase;
  blocks: DraftBlock[];
  specGroups: DraftSpecGroup[];
  boxItems: DraftBoxItem[];
  faqs: DraftFaq[];
}

export const emptyBlock = (type: PageBlock["type"]): DraftBlock => ({
  type,
  image: "",
  url: "",
  imageSide: "right",
  headingEn: "",
  headingTh: "",
  bodyEn: "",
  bodyTh: "",
  captionEn: "",
  captionTh: "",
  cards: [],
  model: "",
  eyebrowEn: "",
  eyebrowTh: "",
});

const emptyFigure = (): DraftFigure => ({ value: "", labelEn: "", labelTh: "" });

const emptyColor = (): DraftColor => ({ labelEn: "", labelTh: "", swatch: "#d1d5db", image: "" });

const emptyRow = (): DraftSpecRow => ({ labelEn: "", labelTh: "", valueEn: "", valueTh: "" });

const emptyCard = (): DraftCard => ({
  image: "",
  captionEn: "",
  captionTh: "",
  titleEn: "",
  titleTh: "",
  bodyEn: "",
  bodyTh: "",
});

const emptyBoxItem = (): DraftBoxItem => ({ image: "", nameEn: "", nameTh: "", qty: "1" });

const emptyFaq = (): DraftFaq => ({ questionEn: "", questionTh: "", answerEn: "", answerTh: "" });

/* ---------- Product ↔ draft conversion ---------- */

const loc = (t?: LocalizedText) => ({ en: t?.en ?? "", th: t?.th ?? "" });

export function pageToDraft(page?: ProductPage): DraftPage {
  // Legacy top-of-page video (page.videoUrl) migrates into the ordered blocks
  // as a leading video block, so it reorders alongside everything else and
  // stops being a fixed, separate slot.
  const legacyVideo: DraftBlock[] = page?.videoUrl
    ? [
        {
          ...emptyBlock("video"),
          url: page.videoUrl,
          captionEn: loc(page.videoCaption).en,
          captionTh: loc(page.videoCaption).th,
        },
      ]
    : [];
  const showcase = page?.showcase;
  return {
    showcase: {
      enabled: !!showcase,
      eyebrowEn: loc(showcase?.eyebrow).en,
      eyebrowTh: loc(showcase?.eyebrow).th,
      heroImage: showcase?.heroImage ?? "",
      figures: (showcase?.figures ?? []).map((f) => ({
        value: f.value,
        labelEn: f.label.en,
        labelTh: f.label.th,
      })),
      colors: (showcase?.colors ?? []).map((c) => ({
        labelEn: c.label.en,
        labelTh: c.label.th,
        swatch: c.swatch,
        image: c.image,
      })),
    },
    blocks: [
      ...legacyVideo,
      ...(page?.blocks ?? []).map((b) => ({
      ...emptyBlock(b.type),
      image: "image" in b ? b.image ?? "" : "",
      url: b.type === "video" ? b.url : "",
      imageSide: b.type === "imageText" ? b.imageSide : "right",
      headingEn: "heading" in b ? loc(b.heading).en : "",
      headingTh: "heading" in b ? loc(b.heading).th : "",
      bodyEn: "body" in b ? loc(b.body).en : "",
      bodyTh: "body" in b ? loc(b.body).th : "",
      captionEn: b.type === "video" ? loc(b.caption).en : "",
      captionTh: b.type === "video" ? loc(b.caption).th : "",
      model: b.type === "anatomy" && b.model ? b.model : ("" as const),
      eyebrowEn: b.type === "feature" ? loc(b.eyebrow).en : "",
      eyebrowTh: b.type === "feature" ? loc(b.eyebrow).th : "",
      cards:
        b.type === "cardGrid"
          ? b.cards.map((c) => ({
              ...emptyCard(),
              image: c.image,
              captionEn: c.caption.en,
              captionTh: c.caption.th,
            }))
          : b.type === "showcase"
            ? b.cards.map((c) => ({
                ...emptyCard(),
                image: c.image,
                titleEn: c.title.en,
                titleTh: c.title.th,
                bodyEn: c.body.en,
                bodyTh: c.body.th,
              }))
            : [],
    })),
    ],
    specGroups: (page?.specGroups ?? []).map((g) => ({
      titleEn: g.title.en,
      titleTh: g.title.th,
      rows: g.rows.map((r) => ({
        labelEn: r.label.en,
        labelTh: r.label.th,
        valueEn: r.value.en,
        valueTh: r.value.th,
      })),
    })),
    boxItems: (page?.boxItems ?? []).map((b) => ({
      image: b.image,
      nameEn: b.name.en,
      nameTh: b.name.th,
      qty: String(b.qty ?? 1),
    })),
    faqs: (page?.faqs ?? []).map((f) => ({
      questionEn: f.question.en,
      questionTh: f.question.th,
      answerEn: f.answer.en,
      answerTh: f.answer.th,
    })),
  };
}

/** Draft → payload for the API (parsePage on the server does final cleanup). */
export function draftToPage(draft: DraftPage): Record<string, unknown> {
  const l = (en: string, th: string) => ({ en: en.trim(), th: th.trim() });
  const s = draft.showcase;
  return {
    // sent only while switched on; the server requires its line above the name
    ...(s.enabled
      ? {
          showcase: {
            eyebrow: l(s.eyebrowEn, s.eyebrowTh),
            heroImage: s.heroImage.trim(),
            figures: s.figures.map((f) => ({ value: f.value.trim(), label: l(f.labelEn, f.labelTh) })),
            colors: s.colors.map((c) => ({
              label: l(c.labelEn, c.labelTh),
              swatch: c.swatch.trim(),
              image: c.image.trim(),
            })),
          },
        }
      : {}),
    blocks: draft.blocks.map((b) => ({
      type: b.type,
      image: b.image.trim(),
      url: b.url.trim(),
      imageSide: b.imageSide,
      heading: l(b.headingEn, b.headingTh),
      body: l(b.bodyEn, b.bodyTh),
      caption: l(b.captionEn, b.captionTh),
      eyebrow: l(b.eyebrowEn, b.eyebrowTh),
      model: b.model,
      cards: b.cards.map((c) => ({
        image: c.image.trim(),
        caption: l(c.captionEn, c.captionTh),
        title: l(c.titleEn, c.titleTh),
        body: l(c.bodyEn, c.bodyTh),
      })),
    })),
    specGroups: draft.specGroups.map((g) => ({
      title: l(g.titleEn, g.titleTh),
      rows: g.rows.map((r) => ({
        label: l(r.labelEn, r.labelTh),
        value: l(r.valueEn, r.valueTh),
      })),
    })),
    boxItems: draft.boxItems.map((b) => ({
      image: b.image.trim(),
      name: l(b.nameEn, b.nameTh),
      qty: Number(b.qty) || 1,
    })),
    faqs: draft.faqs.map((f) => ({
      question: l(f.questionEn, f.questionTh),
      answer: l(f.answerEn, f.answerTh),
    })),
  };
}

/* ---------- small shared UI ---------- */

const inputClass =
  "min-h-[42px] w-full rounded-xl border border-forest-100 bg-surface px-3.5 text-[13.5px] text-content placeholder:text-ink-muted/50 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25";
const textareaClass =
  "w-full rounded-xl border border-forest-100 bg-surface px-3.5 py-2.5 text-[13.5px] leading-relaxed text-content placeholder:text-ink-muted/50 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25";
const miniLabel = "mb-1 block text-[11.5px] font-semibold text-ink-muted";

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-accent/15 hover:text-accent-600 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function EnThPair({
  label,
  en,
  th,
  onEn,
  onTh,
  multiline = false,
}: {
  label: string;
  en: string;
  th: string;
  onEn: (v: string) => void;
  onTh: (v: string) => void;
  multiline?: boolean;
}) {
  const t = useTranslations("admin.pageBuilder");
  const Field = multiline ? "textarea" : "input";
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className={miniLabel}>
          {label} ({t("languages.en")})
        </label>
        <Field
          value={en}
          rows={multiline ? 3 : undefined}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            onEn(e.target.value)
          }
          className={multiline ? textareaClass : inputClass}
        />
      </div>
      <div>
        <label className={miniLabel}>
          {label} ({t("languages.th")})
        </label>
        <Field
          value={th}
          rows={multiline ? 3 : undefined}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            onTh(e.target.value)
          }
          className={multiline ? textareaClass : inputClass}
        />
      </div>
    </div>
  );
}

/* ---------- block editor ---------- */

const BLOCK_LABEL_KEYS = {
  banner: "blocks.banner",
  feature: "blocks.feature",
  cardGrid: "blocks.cardGrid",
  showcase: "blocks.showcase",
  imageText: "blocks.imageText",
  video: "blocks.video",
  anatomy: "blocks.anatomy",
} as const satisfies Record<PageBlock["type"], string>;

function BlockEditor({
  block,
  onChange,
}: {
  block: DraftBlock;
  onChange: (next: DraftBlock) => void;
}) {
  const t = useTranslations("admin.pageBuilder");
  const confirm = useConfirm();
  const set = (patch: Partial<DraftBlock>) => onChange({ ...block, ...patch });

  /** Runs the removal only once the admin confirms it. */
  const confirmRemove = async (
    messageKey: string,
    number: number,
    remove: () => void
  ) => {
    const ok = await confirm({
      title: t("confirm.removeTitle"),
      message: t(`confirm.${messageKey}`, { number }),
      confirmLabel: t("confirm.removeButton"),
    });
    if (ok) remove();
  };

  return (
    <div className="space-y-3">
      {block.type === "anatomy" && (
        <div>
          <label className={miniLabel}>{t("fields.anatomyModel")}</label>
          <select
            value={block.model}
            onChange={(e) => set({ model: e.target.value as DraftBlock["model"] })}
            className={inputClass}
          >
            <option value="">{t("anatomyModels.none")}</option>
            {ANATOMY_MODELS.map((m) => (
              <option key={m} value={m}>
                {t(`anatomyModels.${m}`)}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11.5px] text-ink-muted">{t("fields.anatomyModelHint")}</p>
        </div>
      )}
      {(block.type === "banner" ||
        block.type === "feature" ||
        block.type === "imageText") && (
        <div>
          <label className={miniLabel}>
            {t(block.type === "feature" ? "fields.imageUrlOptional" : "fields.imageUrl")}
          </label>
          <input
            value={block.image}
            onChange={(e) => set({ image: e.target.value })}
            placeholder={t("placeholders.url")}
            className={inputClass}
          />
        </div>
      )}

      {block.type === "imageText" && (
        <div>
          <label className={miniLabel}>{t("fields.imagePosition")}</label>
          <select
            value={block.imageSide}
            onChange={(e) => set({ imageSide: e.target.value as "left" | "right" })}
            className={inputClass}
          >
            <option value="right">{t("positions.right")}</option>
            <option value="left">{t("positions.left")}</option>
          </select>
        </div>
      )}

      {block.type === "feature" && (
        <EnThPair
          label={t("fields.eyebrowOptional")}
          en={block.eyebrowEn}
          th={block.eyebrowTh}
          onEn={(v) => set({ eyebrowEn: v })}
          onTh={(v) => set({ eyebrowTh: v })}
        />
      )}

      {(block.type === "feature" ||
        block.type === "cardGrid" ||
        block.type === "showcase" ||
        block.type === "video") && (
        <EnThPair
          label={t(block.type === "feature" ? "fields.heading" : "fields.headingOptional")}
          en={block.headingEn}
          th={block.headingTh}
          onEn={(v) => set({ headingEn: v })}
          onTh={(v) => set({ headingTh: v })}
        />
      )}

      {(block.type === "feature" || block.type === "imageText") && (
        <EnThPair
          label={t("fields.text")}
          multiline
          en={block.bodyEn}
          th={block.bodyTh}
          onEn={(v) => set({ bodyEn: v })}
          onTh={(v) => set({ bodyTh: v })}
        />
      )}

      {block.type === "video" && (
        <>
          <div>
            <label className={miniLabel}>{t("fields.videoUrl")}</label>
            <input
              value={block.url}
              onChange={(e) => set({ url: e.target.value })}
              placeholder={t("placeholders.youtubeUrl")}
              className={inputClass}
            />
          </div>
          <EnThPair
            label={t("fields.captionOptional")}
            en={block.captionEn}
            th={block.captionTh}
            onEn={(v) => set({ captionEn: v })}
            onTh={(v) => set({ captionTh: v })}
          />
        </>
      )}

      {(block.type === "cardGrid" || block.type === "showcase") && (
        <div className="space-y-3">
          {block.cards.map((card, i) => (
            <div
              key={i}
              className="rounded-xl border border-forest-100 bg-cloud/60 p-3"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-3">
                  <div>
                    <label className={miniLabel}>
                      {t("fields.cardImageUrl", { number: i + 1 })}
                    </label>
                    <input
                      value={card.image}
                      onChange={(e) => {
                        const cards = [...block.cards];
                        cards[i] = { ...card, image: e.target.value };
                        set({ cards });
                      }}
                      placeholder={t("placeholders.url")}
                      className={inputClass}
                    />
                  </div>
                  {block.type === "cardGrid" ? (
                    <EnThPair
                      label={t("fields.caption")}
                      en={card.captionEn}
                      th={card.captionTh}
                      onEn={(v) => {
                        const cards = [...block.cards];
                        cards[i] = { ...card, captionEn: v };
                        set({ cards });
                      }}
                      onTh={(v) => {
                        const cards = [...block.cards];
                        cards[i] = { ...card, captionTh: v };
                        set({ cards });
                      }}
                    />
                  ) : (
                    <>
                      <EnThPair
                        label={t("fields.cardTitle")}
                        en={card.titleEn}
                        th={card.titleTh}
                        onEn={(v) => {
                          const cards = [...block.cards];
                          cards[i] = { ...card, titleEn: v };
                          set({ cards });
                        }}
                        onTh={(v) => {
                          const cards = [...block.cards];
                          cards[i] = { ...card, titleTh: v };
                          set({ cards });
                        }}
                      />
                      <EnThPair
                        label={t("fields.cardText")}
                        multiline
                        en={card.bodyEn}
                        th={card.bodyTh}
                        onEn={(v) => {
                          const cards = [...block.cards];
                          cards[i] = { ...card, bodyEn: v };
                          set({ cards });
                        }}
                        onTh={(v) => {
                          const cards = [...block.cards];
                          cards[i] = { ...card, bodyTh: v };
                          set({ cards });
                        }}
                      />
                    </>
                  )}
                </div>
                <IconButton
                  label={t("actions.removeCard", { number: i + 1 })}
                  onClick={() =>
                    confirmRemove("card", i + 1, () =>
                      set({ cards: block.cards.filter((_, j) => j !== i) })
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </IconButton>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set({ cards: [...block.cards, emptyCard()] })}
            className="flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-full border border-forest-100 px-4 text-[12.5px] font-semibold text-content transition-colors hover:border-accent"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            {t("actions.addCard")}
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- full-screen page ---------- */

function ShowcaseEditor({
  showcase,
  onChange,
}: {
  showcase: DraftShowcase;
  onChange: (next: DraftShowcase) => void;
}) {
  const t = useTranslations("admin.pageBuilder");
  const confirm = useConfirm();
  const set = (patch: Partial<DraftShowcase>) => onChange({ ...showcase, ...patch });

  const confirmRemove = async (messageKey: string, number: number, remove: () => void) => {
    const ok = await confirm({
      title: t("confirm.removeTitle"),
      message: t(`confirm.${messageKey}`, { number }),
      confirmLabel: t("confirm.removeButton"),
    });
    if (ok) remove();
  };

  const setFigure = (i: number, patch: Partial<DraftFigure>) => {
    const figures = [...showcase.figures];
    figures[i] = { ...figures[i], ...patch };
    set({ figures });
  };
  const setColor = (i: number, patch: Partial<DraftColor>) => {
    const colors = [...showcase.colors];
    colors[i] = { ...colors[i], ...patch };
    set({ colors });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-[13.5px] font-bold text-content">
        {t("showcasePage.title")}
        <span className="ml-2 font-normal text-ink-muted">{t("showcasePage.note")}</span>
      </h3>
      <div className="rounded-2xl border border-forest-100 bg-surface p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={showcase.enabled}
            onChange={(e) => set({ enabled: e.target.checked })}
            className="mt-0.5 h-4 w-4 accent-[rgb(var(--accent-rgb))]"
          />
          <span>
            <span className="block text-[13.5px] font-semibold text-content">
              {t("showcasePage.enable")}
            </span>
            <span className="mt-0.5 block text-[11.5px] text-ink-muted">
              {t("showcasePage.enableHint")}
            </span>
          </span>
        </label>

        {showcase.enabled && (
          <div className="mt-4 space-y-5 border-t border-forest-100 pt-4">
            <div>
              <EnThPair
                label={t("showcasePage.eyebrow")}
                en={showcase.eyebrowEn}
                th={showcase.eyebrowTh}
                onEn={(v) => set({ eyebrowEn: v })}
                onTh={(v) => set({ eyebrowTh: v })}
              />
              <p className="mt-1 text-[11.5px] text-ink-muted">{t("showcasePage.eyebrowHint")}</p>
            </div>

            <div>
              <label className={miniLabel}>{t("showcasePage.heroImage")}</label>
              <input
                value={showcase.heroImage}
                onChange={(e) => set({ heroImage: e.target.value })}
                placeholder={t("placeholders.url")}
                className={inputClass}
              />
              <p className="mt-1 text-[11.5px] text-ink-muted">{t("showcasePage.heroImageHint")}</p>
            </div>

            {/* key figures */}
            <div className="space-y-3">
              <p className="text-[12.5px] font-bold text-content">
                {t("showcasePage.figuresTitle")}
                <span className="ml-2 font-normal text-ink-muted">
                  {t("showcasePage.figuresNote")}
                </span>
              </p>
              {showcase.figures.map((figure, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-xl border border-forest-100 bg-cloud/60 p-3"
                >
                  <div className="flex-1 space-y-3">
                    <p className="text-[11.5px] font-bold tracking-wide text-accent-600 uppercase">
                      {t("showcasePage.figureLabel", { number: i + 1 })}
                    </p>
                    <div className="sm:w-1/2">
                      <label className={miniLabel}>{t("showcasePage.figureValue")}</label>
                      <input
                        value={figure.value}
                        onChange={(e) => setFigure(i, { value: e.target.value })}
                        placeholder="2–4 h"
                        className={inputClass}
                      />
                    </div>
                    <EnThPair
                      label={t("showcasePage.figureName")}
                      en={figure.labelEn}
                      th={figure.labelTh}
                      onEn={(v) => setFigure(i, { labelEn: v })}
                      onTh={(v) => setFigure(i, { labelTh: v })}
                    />
                  </div>
                  <IconButton
                    label={t("showcasePage.removeFigure", { number: i + 1 })}
                    onClick={() =>
                      confirmRemove("figure", i + 1, () =>
                        set({ figures: showcase.figures.filter((_, j) => j !== i) })
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </IconButton>
                </div>
              ))}
              {showcase.figures.length < MAX_SHOWCASE_FIGURES && (
                <button
                  type="button"
                  onClick={() => set({ figures: [...showcase.figures, emptyFigure()] })}
                  className="flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-full border border-forest-100 px-4 text-[12.5px] font-semibold text-content transition-colors hover:border-accent"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("showcasePage.addFigure")}
                </button>
              )}
            </div>

            {/* colours */}
            <div className="space-y-3">
              <p className="text-[12.5px] font-bold text-content">
                {t("showcasePage.colorsTitle")}
                <span className="ml-2 font-normal text-ink-muted">
                  {t("showcasePage.colorsNote")}
                </span>
              </p>
              {showcase.colors.map((color, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-xl border border-forest-100 bg-cloud/60 p-3"
                >
                  <div className="flex-1 space-y-3">
                    <p className="text-[11.5px] font-bold tracking-wide text-accent-600 uppercase">
                      {t("showcasePage.colorLabel", { number: i + 1 })}
                    </p>
                    <EnThPair
                      label={t("showcasePage.colorName")}
                      en={color.labelEn}
                      th={color.labelTh}
                      onEn={(v) => setColor(i, { labelEn: v })}
                      onTh={(v) => setColor(i, { labelTh: v })}
                    />
                    <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
                      <div>
                        <label className={miniLabel}>{t("showcasePage.colorSwatch")}</label>
                        <input
                          type="color"
                          value={/^#[0-9a-f]{6}$/i.test(color.swatch) ? color.swatch : "#d1d5db"}
                          onChange={(e) => setColor(i, { swatch: e.target.value })}
                          className="h-[42px] w-full cursor-pointer rounded-xl border border-forest-100 bg-surface p-1"
                        />
                      </div>
                      <div>
                        <label className={miniLabel}>{t("showcasePage.colorImage")}</label>
                        <input
                          value={color.image}
                          onChange={(e) => setColor(i, { image: e.target.value })}
                          placeholder={t("placeholders.url")}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                  <IconButton
                    label={t("showcasePage.removeColor", { number: i + 1 })}
                    onClick={() =>
                      confirmRemove("color", i + 1, () =>
                        set({ colors: showcase.colors.filter((_, j) => j !== i) })
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </IconButton>
                </div>
              ))}
              <button
                type="button"
                onClick={() => set({ colors: [...showcase.colors, emptyColor()] })}
                className="flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-full border border-forest-100 px-4 text-[12.5px] font-semibold text-content transition-colors hover:border-accent"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                {t("showcasePage.addColor")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- main component ---------- */

export default function PageBuilder({
  draft,
  onChange,
}: {
  draft: DraftPage;
  onChange: (next: DraftPage) => void;
}) {
  const t = useTranslations("admin.pageBuilder");
  const confirm = useConfirm();
  const set = (patch: Partial<DraftPage>) => onChange({ ...draft, ...patch });

  /** Runs the removal only once the admin confirms it. */
  const confirmRemove = async (
    messageKey: string,
    number: number,
    remove: () => void
  ) => {
    const ok = await confirm({
      title: t("confirm.removeTitle"),
      message: t(`confirm.${messageKey}`, { number }),
      confirmLabel: t("confirm.removeButton"),
    });
    if (ok) remove();
  };

  const move = <T,>(arr: T[], from: number, dir: -1 | 1): T[] => {
    const to = from + dir;
    if (to < 0 || to >= arr.length) return arr;
    const next = [...arr];
    [next[from], next[to]] = [next[to], next[from]];
    return next;
  };

  return (
    <div className="space-y-8">
      <ShowcaseEditor showcase={draft.showcase} onChange={(showcase) => set({ showcase })} />

      {/* content blocks — including videos; add a "video" section and move it
          wherever you want. (The old fixed top-of-page video field was folded
          into these blocks so everything shares one order.) */}
      <div className="space-y-3">
        <h3 className="text-[13.5px] font-bold text-content">
          {t("content.title")}
          <span className="ml-2 font-normal text-ink-muted">
            {t("content.note")}
          </span>
        </h3>
        {draft.blocks.map((block, i) => (
          <div key={i} className="rounded-2xl border border-forest-100 bg-surface p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[12px] font-bold uppercase tracking-wide text-accent-600">
                {t("content.sectionLabel", {
                  number: i + 1,
                  type: t(BLOCK_LABEL_KEYS[block.type]),
                })}
              </p>
              <div className="flex items-center">
                <IconButton
                  label={t("actions.moveSectionUp", { number: i + 1 })}
                  onClick={() => set({ blocks: move(draft.blocks, i, -1) })}
                  disabled={i === 0}
                >
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                </IconButton>
                <IconButton
                  label={t("actions.moveSectionDown", { number: i + 1 })}
                  onClick={() => set({ blocks: move(draft.blocks, i, 1) })}
                  disabled={i === draft.blocks.length - 1}
                >
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </IconButton>
                <IconButton
                  label={t("actions.removeSection", { number: i + 1 })}
                  onClick={() =>
                    confirmRemove("section", i + 1, () =>
                      set({ blocks: draft.blocks.filter((_, j) => j !== i) })
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </IconButton>
              </div>
            </div>
            <BlockEditor
              block={block}
              onChange={(next) => {
                const blocks = [...draft.blocks];
                blocks[i] = next;
                set({ blocks });
              }}
            />
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(BLOCK_LABEL_KEYS) as PageBlock["type"][]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => set({ blocks: [...draft.blocks, emptyBlock(type)] })}
              className="flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-full border border-forest-100 px-4 text-[12.5px] font-semibold text-content transition-colors hover:border-accent"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              {t(BLOCK_LABEL_KEYS[type])}
            </button>
          ))}
        </div>
      </div>

      {/* spec table */}
      <div className="space-y-3">
        <h3 className="text-[13.5px] font-bold text-content">
          {t("specs.title")}
          <span className="ml-2 font-normal text-ink-muted">
            {t("specs.note")}
          </span>
        </h3>
        {draft.specGroups.map((group, gi) => (
          <div key={gi} className="rounded-2xl border border-forest-100 bg-surface p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[12px] font-bold uppercase tracking-wide text-accent-600">
                {t("specs.groupLabel", { number: gi + 1 })}
              </p>
              <div className="flex items-center">
                <IconButton
                  label={t("actions.moveGroupUp", { number: gi + 1 })}
                  onClick={() => set({ specGroups: move(draft.specGroups, gi, -1) })}
                  disabled={gi === 0}
                >
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                </IconButton>
                <IconButton
                  label={t("actions.moveGroupDown", { number: gi + 1 })}
                  onClick={() => set({ specGroups: move(draft.specGroups, gi, 1) })}
                  disabled={gi === draft.specGroups.length - 1}
                >
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </IconButton>
                <IconButton
                  label={t("actions.removeGroup", { number: gi + 1 })}
                  onClick={() =>
                    confirmRemove("group", gi + 1, () =>
                      set({ specGroups: draft.specGroups.filter((_, j) => j !== gi) })
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </IconButton>
              </div>
            </div>
            <EnThPair
              label={t("fields.groupTitle")}
              en={group.titleEn}
              th={group.titleTh}
              onEn={(v) => {
                const specGroups = [...draft.specGroups];
                specGroups[gi] = { ...group, titleEn: v };
                set({ specGroups });
              }}
              onTh={(v) => {
                const specGroups = [...draft.specGroups];
                specGroups[gi] = { ...group, titleTh: v };
                set({ specGroups });
              }}
            />
            <div className="mt-3 space-y-3">
              {group.rows.map((row, ri) => (
                <div
                  key={ri}
                  className="flex items-start gap-2 rounded-xl border border-forest-100 bg-cloud/60 p-3"
                >
                  <div className="grid flex-1 gap-3 sm:grid-cols-2">
                    <EnThPair
                      label={t("fields.rowLabel", { number: ri + 1 })}
                      en={row.labelEn}
                      th={row.labelTh}
                      onEn={(v) => {
                        const specGroups = [...draft.specGroups];
                        const rows = [...group.rows];
                        rows[ri] = { ...row, labelEn: v };
                        specGroups[gi] = { ...group, rows };
                        set({ specGroups });
                      }}
                      onTh={(v) => {
                        const specGroups = [...draft.specGroups];
                        const rows = [...group.rows];
                        rows[ri] = { ...row, labelTh: v };
                        specGroups[gi] = { ...group, rows };
                        set({ specGroups });
                      }}
                    />
                    <EnThPair
                      label={t("fields.value")}
                      en={row.valueEn}
                      th={row.valueTh}
                      onEn={(v) => {
                        const specGroups = [...draft.specGroups];
                        const rows = [...group.rows];
                        rows[ri] = { ...row, valueEn: v };
                        specGroups[gi] = { ...group, rows };
                        set({ specGroups });
                      }}
                      onTh={(v) => {
                        const specGroups = [...draft.specGroups];
                        const rows = [...group.rows];
                        rows[ri] = { ...row, valueTh: v };
                        specGroups[gi] = { ...group, rows };
                        set({ specGroups });
                      }}
                    />
                  </div>
                  <IconButton
                    label={t("actions.removeRow", { number: ri + 1 })}
                    onClick={() =>
                      confirmRemove("row", ri + 1, () => {
                        const specGroups = [...draft.specGroups];
                        specGroups[gi] = {
                          ...group,
                          rows: group.rows.filter((_, j) => j !== ri),
                        };
                        set({ specGroups });
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </IconButton>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const specGroups = [...draft.specGroups];
                  specGroups[gi] = { ...group, rows: [...group.rows, emptyRow()] };
                  set({ specGroups });
                }}
                className="flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-full border border-forest-100 px-4 text-[12.5px] font-semibold text-content transition-colors hover:border-accent"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                {t("actions.addRow")}
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            set({
              specGroups: [
                ...draft.specGroups,
                { titleEn: "", titleTh: "", rows: [emptyRow()] },
              ],
            })
          }
          className="flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-full border border-forest-100 px-4 text-[12.5px] font-semibold text-content transition-colors hover:border-accent"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          {t("actions.addSpecGroup")}
        </button>
      </div>

      {/* what's in the box — rendered after the spec table on the product page */}
      <div className="space-y-3">
        <h3 className="text-[13.5px] font-bold text-content">
          {t("box.title")}
          <span className="ml-2 font-normal text-ink-muted">{t("box.note")}</span>
        </h3>
        {draft.boxItems.map((item, i) => (
          <div key={i} className="rounded-2xl border border-forest-100 bg-surface p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[12px] font-bold uppercase tracking-wide text-accent-600">
                {t("box.itemLabel", { number: i + 1 })}
              </p>
              <div className="flex items-center">
                <IconButton
                  label={t("actions.moveBoxItemUp", { number: i + 1 })}
                  onClick={() => set({ boxItems: move(draft.boxItems, i, -1) })}
                  disabled={i === 0}
                >
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                </IconButton>
                <IconButton
                  label={t("actions.moveBoxItemDown", { number: i + 1 })}
                  onClick={() => set({ boxItems: move(draft.boxItems, i, 1) })}
                  disabled={i === draft.boxItems.length - 1}
                >
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </IconButton>
                <IconButton
                  label={t("actions.removeBoxItem", { number: i + 1 })}
                  onClick={() =>
                    confirmRemove("boxItem", i + 1, () =>
                      set({ boxItems: draft.boxItems.filter((_, j) => j !== i) })
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </IconButton>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className={miniLabel}>{t("fields.imageUrl")}</label>
                <input
                  value={item.image}
                  onChange={(e) => {
                    const boxItems = [...draft.boxItems];
                    boxItems[i] = { ...item, image: e.target.value };
                    set({ boxItems });
                  }}
                  placeholder={t("placeholders.url")}
                  className={inputClass}
                />
              </div>
              <EnThPair
                label={t("fields.boxItemName")}
                en={item.nameEn}
                th={item.nameTh}
                onEn={(v) => {
                  const boxItems = [...draft.boxItems];
                  boxItems[i] = { ...item, nameEn: v };
                  set({ boxItems });
                }}
                onTh={(v) => {
                  const boxItems = [...draft.boxItems];
                  boxItems[i] = { ...item, nameTh: v };
                  set({ boxItems });
                }}
              />
              <div className="w-28">
                <label className={miniLabel}>{t("fields.boxItemQty")}</label>
                <input
                  type="number"
                  min={1}
                  value={item.qty}
                  onChange={(e) => {
                    const boxItems = [...draft.boxItems];
                    boxItems[i] = { ...item, qty: e.target.value };
                    set({ boxItems });
                  }}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => set({ boxItems: [...draft.boxItems, emptyBoxItem()] })}
          className="flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-full border border-forest-100 px-4 text-[12.5px] font-semibold text-content transition-colors hover:border-accent"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          {t("actions.addBoxItem")}
        </button>
      </div>

      {/* FAQ — rendered as an accordion near the bottom of the product page */}
      <div className="space-y-3">
        <h3 className="text-[13.5px] font-bold text-content">
          {t("faq.title")}
          <span className="ml-2 font-normal text-ink-muted">{t("faq.note")}</span>
        </h3>
        {draft.faqs.map((item, i) => (
          <div key={i} className="rounded-2xl border border-forest-100 bg-surface p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[12px] font-bold uppercase tracking-wide text-accent-600">
                {t("faq.itemLabel", { number: i + 1 })}
              </p>
              <div className="flex items-center">
                <IconButton
                  label={t("actions.moveFaqUp", { number: i + 1 })}
                  onClick={() => set({ faqs: move(draft.faqs, i, -1) })}
                  disabled={i === 0}
                >
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                </IconButton>
                <IconButton
                  label={t("actions.moveFaqDown", { number: i + 1 })}
                  onClick={() => set({ faqs: move(draft.faqs, i, 1) })}
                  disabled={i === draft.faqs.length - 1}
                >
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </IconButton>
                <IconButton
                  label={t("actions.removeFaq", { number: i + 1 })}
                  onClick={() =>
                    confirmRemove("faq", i + 1, () =>
                      set({ faqs: draft.faqs.filter((_, j) => j !== i) })
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </IconButton>
              </div>
            </div>
            <div className="space-y-3">
              <EnThPair
                label={t("fields.faqQuestion")}
                en={item.questionEn}
                th={item.questionTh}
                onEn={(v) => {
                  const faqs = [...draft.faqs];
                  faqs[i] = { ...item, questionEn: v };
                  set({ faqs });
                }}
                onTh={(v) => {
                  const faqs = [...draft.faqs];
                  faqs[i] = { ...item, questionTh: v };
                  set({ faqs });
                }}
              />
              <EnThPair
                label={t("fields.faqAnswer")}
                multiline
                en={item.answerEn}
                th={item.answerTh}
                onEn={(v) => {
                  const faqs = [...draft.faqs];
                  faqs[i] = { ...item, answerEn: v };
                  set({ faqs });
                }}
                onTh={(v) => {
                  const faqs = [...draft.faqs];
                  faqs[i] = { ...item, answerTh: v };
                  set({ faqs });
                }}
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => set({ faqs: [...draft.faqs, emptyFaq()] })}
          className="flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-full border border-forest-100 px-4 text-[12.5px] font-semibold text-content transition-colors hover:border-accent"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          {t("actions.addFaq")}
        </button>
      </div>
    </div>
  );
}

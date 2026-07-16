"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import type { LocalizedText, PageBlock, ProductPage } from "@/data/products";

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
export interface DraftPage {
  videoUrl: string;
  videoCaptionEn: string;
  videoCaptionTh: string;
  blocks: DraftBlock[];
  specGroups: DraftSpecGroup[];
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
});

const emptyRow = (): DraftSpecRow => ({ labelEn: "", labelTh: "", valueEn: "", valueTh: "" });

/* ---------- Product ↔ draft conversion ---------- */

const loc = (t?: LocalizedText) => ({ en: t?.en ?? "", th: t?.th ?? "" });

export function pageToDraft(page?: ProductPage): DraftPage {
  return {
    videoUrl: page?.videoUrl ?? "",
    videoCaptionEn: loc(page?.videoCaption).en,
    videoCaptionTh: loc(page?.videoCaption).th,
    blocks: (page?.blocks ?? []).map((b) => ({
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
      cards:
        b.type === "cardGrid"
          ? b.cards.map((c) => ({
              image: c.image,
              captionEn: c.caption.en,
              captionTh: c.caption.th,
            }))
          : [],
    })),
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
  };
}

/** Draft → payload for the API (parsePage on the server does final cleanup). */
export function draftToPage(draft: DraftPage): Record<string, unknown> {
  const l = (en: string, th: string) => ({ en: en.trim(), th: th.trim() });
  return {
    videoUrl: draft.videoUrl.trim(),
    videoCaption: l(draft.videoCaptionEn, draft.videoCaptionTh),
    blocks: draft.blocks.map((b) => ({
      type: b.type,
      image: b.image.trim(),
      url: b.url.trim(),
      imageSide: b.imageSide,
      heading: l(b.headingEn, b.headingTh),
      body: l(b.bodyEn, b.bodyTh),
      caption: l(b.captionEn, b.captionTh),
      cards: b.cards.map((c) => ({
        image: c.image.trim(),
        caption: l(c.captionEn, c.captionTh),
      })),
    })),
    specGroups: draft.specGroups.map((g) => ({
      title: l(g.titleEn, g.titleTh),
      rows: g.rows.map((r) => ({
        label: l(r.labelEn, r.labelTh),
        value: l(r.valueEn, r.valueTh),
      })),
    })),
  };
}

/* ---------- small shared UI ---------- */

const inputClass =
  "min-h-[42px] w-full rounded-xl border border-forest-100 bg-surface px-3.5 text-[13.5px] text-content placeholder:text-ink-muted/50 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25";
const textareaClass =
  "w-full rounded-xl border border-forest-100 bg-surface px-3.5 py-2.5 text-[13.5px] leading-relaxed text-content placeholder:text-ink-muted/50 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25";
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
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-gold/15 hover:text-gold-600 disabled:cursor-not-allowed disabled:opacity-30"
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
  const Field = multiline ? "textarea" : "input";
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className={miniLabel}>{label} (EN)</label>
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
        <label className={miniLabel}>{label} (TH)</label>
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

const BLOCK_LABELS: Record<PageBlock["type"], string> = {
  banner: "Full-width image",
  feature: "Feature (heading + text, optional image)",
  cardGrid: "Image card grid",
  imageText: "Image + text row",
  video: "Video section",
};

function BlockEditor({
  block,
  onChange,
}: {
  block: DraftBlock;
  onChange: (next: DraftBlock) => void;
}) {
  const set = (patch: Partial<DraftBlock>) => onChange({ ...block, ...patch });

  return (
    <div className="space-y-3">
      {(block.type === "banner" ||
        block.type === "feature" ||
        block.type === "imageText") && (
        <div>
          <label className={miniLabel}>
            Image URL{block.type === "feature" ? " (optional)" : ""}
          </label>
          <input
            value={block.image}
            onChange={(e) => set({ image: e.target.value })}
            placeholder="https://…"
            className={inputClass}
          />
        </div>
      )}

      {block.type === "imageText" && (
        <div>
          <label className={miniLabel}>Image position</label>
          <select
            value={block.imageSide}
            onChange={(e) => set({ imageSide: e.target.value as "left" | "right" })}
            className={inputClass}
          >
            <option value="right">Image on the right</option>
            <option value="left">Image on the left</option>
          </select>
        </div>
      )}

      {(block.type === "feature" || block.type === "cardGrid" || block.type === "video") && (
        <EnThPair
          label={`Heading${block.type !== "feature" ? " (optional)" : ""}`}
          en={block.headingEn}
          th={block.headingTh}
          onEn={(v) => set({ headingEn: v })}
          onTh={(v) => set({ headingTh: v })}
        />
      )}

      {(block.type === "feature" || block.type === "imageText") && (
        <EnThPair
          label="Text"
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
            <label className={miniLabel}>Video URL (YouTube link or .mp4)</label>
            <input
              value={block.url}
              onChange={(e) => set({ url: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=…"
              className={inputClass}
            />
          </div>
          <EnThPair
            label="Caption (optional)"
            en={block.captionEn}
            th={block.captionTh}
            onEn={(v) => set({ captionEn: v })}
            onTh={(v) => set({ captionTh: v })}
          />
        </>
      )}

      {block.type === "cardGrid" && (
        <div className="space-y-3">
          {block.cards.map((card, i) => (
            <div
              key={i}
              className="rounded-xl border border-forest-100 bg-cloud/60 p-3"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-3">
                  <div>
                    <label className={miniLabel}>Card {i + 1} image URL</label>
                    <input
                      value={card.image}
                      onChange={(e) => {
                        const cards = [...block.cards];
                        cards[i] = { ...card, image: e.target.value };
                        set({ cards });
                      }}
                      placeholder="https://…"
                      className={inputClass}
                    />
                  </div>
                  <EnThPair
                    label="Caption"
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
                </div>
                <IconButton
                  label={`Remove card ${i + 1}`}
                  onClick={() => set({ cards: block.cards.filter((_, j) => j !== i) })}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </IconButton>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              set({ cards: [...block.cards, { image: "", captionEn: "", captionTh: "" }] })
            }
            className="flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-full border border-forest-100 px-4 text-[12.5px] font-semibold text-content transition-colors hover:border-gold"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add card
          </button>
        </div>
      )}
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
  const set = (patch: Partial<DraftPage>) => onChange({ ...draft, ...patch });

  const move = <T,>(arr: T[], from: number, dir: -1 | 1): T[] => {
    const to = from + dir;
    if (to < 0 || to >= arr.length) return arr;
    const next = [...arr];
    [next[from], next[to]] = [next[to], next[from]];
    return next;
  };

  return (
    <div className="space-y-8">
      {/* intro video */}
      <div className="space-y-3">
        <h3 className="text-[13.5px] font-bold text-content">
          Intro video
          <span className="ml-2 font-normal text-ink-muted">
            shown under the product info (optional)
          </span>
        </h3>
        <div>
          <label className={miniLabel}>Video URL (YouTube link or .mp4)</label>
          <input
            value={draft.videoUrl}
            onChange={(e) => set({ videoUrl: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=…"
            className={inputClass}
          />
        </div>
        {draft.videoUrl.trim() && (
          <EnThPair
            label="Caption (optional)"
            en={draft.videoCaptionEn}
            th={draft.videoCaptionTh}
            onEn={(v) => set({ videoCaptionEn: v })}
            onTh={(v) => set({ videoCaptionTh: v })}
          />
        )}
      </div>

      {/* content blocks */}
      <div className="space-y-3">
        <h3 className="text-[13.5px] font-bold text-content">
          Content sections
          <span className="ml-2 font-normal text-ink-muted">
            mix and reorder freely — robots with fewer photos just use fewer sections
          </span>
        </h3>
        {draft.blocks.map((block, i) => (
          <div key={i} className="rounded-2xl border border-forest-100 bg-surface p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[12px] font-bold uppercase tracking-wide text-gold-600">
                {i + 1}. {BLOCK_LABELS[block.type]}
              </p>
              <div className="flex items-center">
                <IconButton
                  label={`Move section ${i + 1} up`}
                  onClick={() => set({ blocks: move(draft.blocks, i, -1) })}
                  disabled={i === 0}
                >
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                </IconButton>
                <IconButton
                  label={`Move section ${i + 1} down`}
                  onClick={() => set({ blocks: move(draft.blocks, i, 1) })}
                  disabled={i === draft.blocks.length - 1}
                >
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </IconButton>
                <IconButton
                  label={`Remove section ${i + 1}`}
                  onClick={() => set({ blocks: draft.blocks.filter((_, j) => j !== i) })}
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
          {(Object.keys(BLOCK_LABELS) as PageBlock["type"][]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => set({ blocks: [...draft.blocks, emptyBlock(type)] })}
              className="flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-full border border-forest-100 px-4 text-[12.5px] font-semibold text-content transition-colors hover:border-gold"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              {BLOCK_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {/* spec table */}
      <div className="space-y-3">
        <h3 className="text-[13.5px] font-bold text-content">
          Detailed specification table
          <span className="ml-2 font-normal text-ink-muted">
            grouped rows; replaces the compact spec band when filled in
          </span>
        </h3>
        {draft.specGroups.map((group, gi) => (
          <div key={gi} className="rounded-2xl border border-forest-100 bg-surface p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[12px] font-bold uppercase tracking-wide text-gold-600">
                Group {gi + 1}
              </p>
              <div className="flex items-center">
                <IconButton
                  label={`Move group ${gi + 1} up`}
                  onClick={() => set({ specGroups: move(draft.specGroups, gi, -1) })}
                  disabled={gi === 0}
                >
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                </IconButton>
                <IconButton
                  label={`Move group ${gi + 1} down`}
                  onClick={() => set({ specGroups: move(draft.specGroups, gi, 1) })}
                  disabled={gi === draft.specGroups.length - 1}
                >
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </IconButton>
                <IconButton
                  label={`Remove group ${gi + 1}`}
                  onClick={() =>
                    set({ specGroups: draft.specGroups.filter((_, j) => j !== gi) })
                  }
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </IconButton>
              </div>
            </div>
            <EnThPair
              label="Group title"
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
                      label={`Row ${ri + 1} — label`}
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
                      label="Value"
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
                    label={`Remove row ${ri + 1}`}
                    onClick={() => {
                      const specGroups = [...draft.specGroups];
                      specGroups[gi] = {
                        ...group,
                        rows: group.rows.filter((_, j) => j !== ri),
                      };
                      set({ specGroups });
                    }}
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
                className="flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-full border border-forest-100 px-4 text-[12.5px] font-semibold text-content transition-colors hover:border-gold"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add row
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
          className="flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-full border border-forest-100 px-4 text-[12.5px] font-semibold text-content transition-colors hover:border-gold"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add spec group
        </button>
      </div>
    </div>
  );
}

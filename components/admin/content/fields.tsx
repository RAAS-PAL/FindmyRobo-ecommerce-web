"use client";

import { useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp, ImagePlus, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useConfirm } from "@/components/admin/ConfirmProvider";
import type { Bilingual } from "@/data/siteContent";
import type { PreviewTarget } from "@/lib/cmsPreview";
import { usePreviewTarget } from "./PreviewTarget";

/**
 * Form building blocks for Admin → Content. Same look as ProductForm (the
 * class strings below are copied from it on purpose, so the two editors read
 * as one panel), but controlled: each section editor owns one state object and
 * these only render and report changes.
 */

export const inputClass =
  "min-h-[46px] w-full rounded-xl border border-forest-100 bg-surface px-4 text-[14px] text-content placeholder:text-ink-muted/50 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25";
export const textareaClass =
  "w-full rounded-xl border border-forest-100 bg-surface px-4 py-3 text-[14px] leading-relaxed text-content placeholder:text-ink-muted/50 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25";
export const labelClass = "mb-1.5 block text-[13px] font-semibold text-content";
export const hintClass = "mt-1 text-[11.5px] leading-relaxed text-ink-muted";
const smallButtonClass =
  "flex min-h-[38px] cursor-pointer items-center gap-2 rounded-full border border-forest-100 px-4 text-[12.5px] font-semibold text-content transition-colors hover:border-gold disabled:cursor-not-allowed disabled:opacity-50";

/**
 * A titled card. Collapsible, so a long section can be skimmed. With a
 * `previewTarget`, opening it or working in it scrolls the live preview to
 * that part of the page.
 */
export function Panel({
  title,
  note,
  children,
  defaultOpen = true,
  previewTarget,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  previewTarget?: PreviewTarget;
}) {
  const requestPreview = usePreviewTarget();
  return (
    <details
      open={defaultOpen}
      onFocusCapture={() => previewTarget && requestPreview?.(previewTarget)}
      className="group rounded-2xl border border-forest-100 bg-surface [&_summary::-webkit-details-marker]:hidden"
    >
      <summary
        // Opening a panel scrolls the preview to it. Deliberately on the click,
        // not on <details> "toggle": browsers fire toggle for panels that start
        // open, which would scroll the preview to the last one on page load.
        // `open` is still the old state here — the click toggles it afterwards.
        onClick={(e) => {
          const details = e.currentTarget.parentElement as HTMLDetailsElement;
          if (previewTarget && !details.open) requestPreview?.(previewTarget, true);
        }}
        className="flex cursor-pointer list-none items-start justify-between gap-4 p-6 sm:px-8"
      >
        <span>
          <span className="block font-display text-lg font-bold text-content">{title}</span>
          {note && <span className="mt-1 block text-[12.5px] text-ink-muted">{note}</span>}
        </span>
        <ChevronDown
          className="mt-1 h-5 w-5 shrink-0 text-ink-muted transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="space-y-6 border-t border-forest-100 p-6 sm:px-8">{children}</div>
    </details>
  );
}

/**
 * Character count against the length search results / layouts actually show.
 * Amber past the recommendation — a warning, not a limit: the hard cap is the
 * input's maxLength (matched by the server validator).
 */
function Counter({ length, recommended }: { length: number; recommended: number }) {
  return (
    <span
      className={`font-mono text-[10.5px] tabular-nums ${
        length > recommended ? "font-semibold text-amber-600" : "text-ink-muted"
      }`}
    >
      {length}/{recommended}
    </span>
  );
}

/** English and Thai side by side — the two versions of one piece of copy. */
export function BilingualField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
  required = false,
  maxLength,
  recommended,
  hint,
  placeholder,
}: {
  label: string;
  value: Bilingual;
  onChange: (value: Bilingual) => void;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  maxLength: number;
  /** Shows a live count against this length (SEO titles, descriptions). */
  recommended?: number;
  hint?: string;
  /** Shown while empty — e.g. what "automatic" will produce. */
  placeholder?: Bilingual;
}) {
  const t = useTranslations("admin.content.fields");
  const id = useId();
  return (
    <fieldset>
      <legend className={labelClass}>
        {label}
        {required && <span className="ml-1 text-gold-600">*</span>}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {(["en", "th"] as const).map((lang) => {
          const props = {
            id: `${id}-${lang}`,
            value: value[lang],
            required,
            maxLength,
            placeholder: placeholder?.[lang],
            lang,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
              onChange({ ...value, [lang]: e.target.value }),
          };
          return (
            <div key={lang}>
              <label
                htmlFor={props.id}
                className="mb-1 flex items-center justify-between gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-ink-muted"
              >
                {lang === "en" ? t("english") : t("thai")}
                {recommended !== undefined && (
                  <Counter length={value[lang].length} recommended={recommended} />
                )}
              </label>
              {multiline ? (
                <textarea {...props} rows={rows} className={textareaClass} />
              ) : (
                <input {...props} className={inputClass} />
              )}
            </div>
          );
        })}
      </div>
      {hint && <p className={hintClass}>{hint}</p>}
    </fieldset>
  );
}

/** One plain value — a phone number, a link, a name. */
export function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  maxLength,
  hint,
  placeholder,
  mono = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "url" | "email" | "tel";
  required?: boolean;
  maxLength: number;
  hint?: string;
  placeholder?: string;
  mono?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span className="ml-1 text-gold-600">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} ${mono ? "font-mono text-[13px]" : ""}`}
      />
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  /** "any" allows decimals, e.g. a 4.7★ rating. */
  step?: number | "any";
  hint?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        value={Number.isFinite(value) ? value : ""}
        min={min}
        max={max}
        step={step}
        required
        onChange={(e) => onChange(e.target.valueAsNumber)}
        className={`${inputClass} font-mono`}
      />
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
          checked ? "bg-forest-700" : "bg-forest-100"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-[13.5px] font-semibold text-content">{label}</span>
        {hint && <span className={`block ${hintClass}`}>{hint}</span>}
      </label>
    </div>
  );
}

/** Send one image to the admin uploader; resolves to its public URL. */
async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  body.append("folder", "content");
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
  return json.url as string;
}

/**
 * An image URL with an upload button and a preview. Uploading just fills in
 * the URL — the stored value is always a link, exactly as if it were pasted.
 */
export function ImageField({
  label,
  value,
  onChange,
  required = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  hint?: string;
}) {
  const t = useTranslations("admin.content.fields");
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (input: HTMLInputElement) => {
    const file = input.files?.[0];
    input.value = ""; // allow re-picking the same file after an error
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      onChange(await uploadImage(file));
    } catch (e) {
      setError(t("uploadFailed", { reason: e instanceof Error ? e.message : "" }));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span className="ml-1 text-gold-600">*</span>}
      </label>
      <div className="flex gap-3">
        <span className="flex h-[46px] w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-forest-100 bg-cloud">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-4 w-4 text-ink-muted/60" aria-hidden="true" />
          )}
        </span>
        <input
          id={id}
          type="text"
          inputMode="url"
          value={value}
          required={required}
          maxLength={2048}
          placeholder="https://… or /posters/…"
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} font-mono text-[12.5px]`}
        />
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        hidden
        onChange={(e) => handleFile(e.currentTarget)}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className={smallButtonClass}
        >
          {uploading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
          )}
          {uploading ? t("uploading") : t("upload")}
        </button>
        {value && !required && (
          <button type="button" onClick={() => onChange("")} className={smallButtonClass}>
            {t("clearImage")}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-1 text-[12px] font-medium text-red-600">
          {error}
        </p>
      )}
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}

/**
 * An ordered list of rows with move up / move down / remove, and an add
 * button. Removing a row that has anything typed in it asks first — the same
 * rule the product page builder follows.
 */
export function ListEditor<T>({
  items,
  onChange,
  create,
  max,
  itemLabel,
  addLabel,
  isEmpty,
  children,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  create: () => T;
  max: number;
  itemLabel: (index: number) => string;
  addLabel: string;
  /** Rows for which this is true are removed without a confirmation. */
  isEmpty?: (item: T) => boolean;
  children: (item: T, update: (item: T) => void, index: number) => React.ReactNode;
}) {
  const t = useTranslations("admin.content.list");
  const confirm = useConfirm();

  const move = (from: number, dir: -1 | 1) => {
    const to = from + dir;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  };

  const remove = async (index: number) => {
    if (!isEmpty?.(items[index])) {
      const ok = await confirm({
        title: t("removeTitle", { item: itemLabel(index) }),
        message: t("removeMessage"),
        confirmLabel: t("remove"),
      });
      if (!ok) return;
    }
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="rounded-2xl border border-forest-100 bg-cloud/40 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="text-[12px] font-bold uppercase tracking-wide text-gold-600">
              {itemLabel(index)}
            </p>
            <div className="flex items-center">
              {[
                { label: t("moveUp"), icon: ChevronUp, onClick: () => move(index, -1), disabled: index === 0 },
                {
                  label: t("moveDown"),
                  icon: ChevronDown,
                  onClick: () => move(index, 1),
                  disabled: index === items.length - 1,
                },
                { label: t("remove"), icon: Trash2, onClick: () => remove(index), disabled: false },
              ].map(({ label, icon: Icon, onClick, disabled }) => (
                <button
                  key={label}
                  type="button"
                  aria-label={`${label} — ${itemLabel(index)}`}
                  title={label}
                  disabled={disabled}
                  onClick={onClick}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-gold/15 hover:text-gold-600 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-5">
            {children(
              item,
              (next) => onChange(items.map((existing, i) => (i === index ? next : existing))),
              index
            )}
          </div>
        </div>
      ))}
      {items.length < max ? (
        <button type="button" onClick={() => onChange([...items, create()])} className={smallButtonClass}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          {addLabel}
        </button>
      ) : (
        <p className={hintClass}>{t("max", { max })}</p>
      )}
    </div>
  );
}

export const emptyBilingual = (): Bilingual => ({ en: "", th: "" });

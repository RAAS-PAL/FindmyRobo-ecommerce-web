import type { Field, GroupField, TextareaField, TextField } from "payload";

/**
 * Field helpers shared by the Payload globals.
 *
 * Content is bilingual the same way the rest of the site is: every piece of
 * copy is stored as `{ en, th }`, the shape data/siteContent.ts already uses.
 * That keeps the storefront mapping trivial (lib/payloadContent.ts) and lets
 * editors see both languages side by side, rather than switching Payload's
 * content locale back and forth.
 *
 * Validation only bites on Publish: Payload skips it for drafts, so a
 * half-written draft can always be saved.
 */

/** A label or description in both admin languages. */
export type Label = { en: string; th: string };
export const L = (en: string, th: string): Label => ({ en, th });

interface BilingualOptions {
  label: Label;
  required?: boolean;
  multiline?: boolean;
  maxLength?: number;
  description?: Label;
  /** Only required while this top-level checkbox is on (e.g. the partner block). */
  requiredWhen?: string;
}

/** `{ en, th }` copy — English and Thai fields next to each other. */
export function bilingual(name: string, options: BilingualOptions): GroupField {
  const { label, required = false, multiline = false, maxLength, description, requiredWhen } = options;

  const validate = (value: unknown, { data }: { data: unknown }): true | string => {
    if (!required) return true;
    if (requiredWhen && (data as Record<string, unknown> | undefined)?.[requiredWhen] !== true) return true;
    return typeof value === "string" && value.trim() ? true : "Required";
  };

  const one = (lang: "en" | "th"): TextField | TextareaField => {
    const base = {
      name: lang,
      label: lang === "en" ? L("English", "อังกฤษ") : L("Thai", "ไทย"),
      ...(maxLength ? { maxLength } : {}),
      admin: { width: "50%" },
      validate,
    };
    return multiline ? { ...base, type: "textarea" } : { ...base, type: "text" };
  };

  return {
    name,
    type: "group",
    label,
    ...(description ? { admin: { description } } : {}),
    fields: [{ type: "row", fields: [one("en"), one("th")] }],
  };
}

/** An image from the media library. */
export function image(
  name: string,
  label: Label,
  options: { required?: boolean; description?: Label } = {}
): Field {
  return {
    name,
    type: "upload",
    relationTo: "media",
    label,
    required: options.required ?? false,
    ...(options.description ? { admin: { description: options.description } } : {}),
  };
}

/**
 * A link that ends up in an href or src on every page. Only https:// or a path
 * on this site — never javascript:, data:, or another site's //host path.
 */
export function link(
  name: string,
  label: Label,
  options: { required?: boolean; httpsOnly?: boolean; description?: Label } = {}
): TextField {
  return {
    name,
    type: "text",
    label,
    ...(options.description ? { admin: { description: options.description } } : {}),
    validate: (value: unknown) => {
      if (typeof value !== "string" || !value.trim()) return options.required ? "Required" : true;
      const v = value.trim();
      if (options.httpsOnly) return /^https:\/\/[^\s/]+\S*$/i.test(v) ? true : "Must start with https://";
      return /^(https?:\/\/[^\s/]+\S*|\/(?!\/)\S*)$/i.test(v) ? true : "Must start with https:// or /";
    },
  };
}

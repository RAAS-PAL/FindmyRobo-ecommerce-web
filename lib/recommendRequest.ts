import { routing } from "@/i18n/routing";
import { EMAIL_RE, PHONE_RE } from "@/lib/quoteRequest";
import type { Answers, Match } from "@/lib/recommend";

/**
 * Server-side helpers for /api/recommendations: the request's locale, the
 * contact form, and the email sales get.
 */

export const asLocale = (value: unknown) =>
  typeof value === "string" && (routing.locales as readonly string[]).includes(value)
    ? value
    : routing.defaultLocale;

export interface RecommendContact {
  name: string;
  phone: string;
  email: string;
  note: string;
}

export type ContactErrors = Partial<Record<keyof RecommendContact | "consent", string>>;

const str = (r: Record<string, unknown>, key: string, max: number) =>
  typeof r[key] === "string" ? (r[key] as string).trim().slice(0, max) : "";

export function asContact(raw: unknown): RecommendContact {
  const r = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  return {
    name: str(r, "name", 100),
    phone: str(r, "phone", 30),
    email: str(r, "email", 200),
    note: str(r, "note", 1000),
  };
}

/** Same rules as the quote form: name and a Thai phone number; email optional. */
export function validateContact(c: RecommendContact, consent: boolean): ContactErrors {
  const errors: ContactErrors = {};
  if (!c.name) errors.name = "required";
  if (!c.phone) errors.phone = "required";
  else if (!PHONE_RE.test(c.phone)) errors.phone = "phone";
  if (c.email && !EMAIL_RE.test(c.email)) errors.email = "email";
  if (!consent) errors.consent = "required";
  return errors;
}

const esc = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const JOB_LABEL: Record<Answers["job"], string> = {
  lawn: "Lawn mowing",
  floor: "Floor cleaning",
  cooking: "Cooking",
  delivery: "Delivery / serving",
};

/** The answers in plain English, for sales. */
export function describeAnswers(a: Answers): [string, string][] {
  const rows: [string, string][] = [["Job", JOB_LABEL[a.job]]];
  if (a.areaM2) rows.push([a.job === "lawn" ? "Lawn area" : "Floor area", `${a.areaM2.toLocaleString("en-US")} m²`]);
  if (a.slope) rows.push(["Steepest slope", a.slope]);
  if (a.operation) rows.push(["Wants", a.operation]);
  if (a.venue) rows.push(["Venue", a.venue]);
  rows.push(["Condition", a.condition]);
  return rows;
}

export function recommendEmail(
  contact: RecommendContact,
  answers: Answers,
  matches: Match[]
): string {
  const rows: [string, string][] = [
    ["Name", contact.name],
    ["Phone", contact.phone],
    ...(contact.email ? ([["Email", contact.email]] as [string, string][]) : []),
    ...describeAnswers(answers),
    [
      "Shown",
      matches.length
        ? matches.map((m, i) => `${i + 1}. ${m.product.name}${m.fits ? "" : " (closest, not a full fit)"}`).join("\n")
        : "No robot matched",
    ],
    ...(contact.note ? ([["Note", contact.note]] as [string, string][]) : []),
  ];
  const body = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-size:13px;color:#6b7280;width:130px;vertical-align:top;">${label}</td><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-size:14px;color:#1a1a1a;">${esc(value).replace(/\n/g, "<br>")}</td></tr>`
    )
    .join("");
  return `<!DOCTYPE html><html><body style="margin:0;padding:24px 12px;background:#f4f5f6;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin:0 auto;background:#ffffff;border-radius:12px;">
<tr><td style="height:6px;background:#2E6BFF;border-radius:12px 12px 0 0;"></td></tr>
<tr><td style="padding:24px 28px 8px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#2E6BFF;font-weight:700;">Robot recommendation</td></tr>
<tr><td style="padding:0 28px 8px;font-size:20px;font-weight:700;color:#17181b;">${esc(contact.name)}</td></tr>
<tr><td style="padding:8px 28px 28px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${body}</table>
<p style="margin:16px 0 0;font-size:13px;"><a href="tel:${esc(contact.phone.replace(/[^\d+]/g, ""))}" style="color:#17181b;">Call ${esc(contact.phone)}</a></p>
</td></tr></table></body></html>`;
}

import { NextResponse } from "next/server";
import type { Product } from "@/data/products";
import { routing } from "@/i18n/routing";
import { emailConfigured, salesAlertRecipients, sendEmail } from "@/lib/email";
import {
  asQuote,
  validateQuote,
  type PuduVenue,
  type QuoteInterest,
  type QuoteRequest,
} from "@/lib/quoteRequest";
import { getAllProducts } from "@/lib/productStore";
import { enforce, MINUTE } from "@/lib/rateLimit";

const esc = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const INTEREST_LABEL: Record<QuoteInterest, string> = {
  "lawn-mowing": "Lawn mowing",
  "pudu-delivery": "Pudu delivery",
};

const VENUE_LABEL: Record<PuduVenue, string> = {
  restaurant: "Restaurant",
  hotel: "Hotel",
  hospital: "Hospital",
  office: "Office",
  mall: "Shopping mall",
  other: "Other",
};

function quoteEmail(quote: QuoteRequest, product?: Product, forProduct?: Product): string {
  const rows: [string, string][] = [["Name", quote.fullName]];
  if (quote.company) rows.push(["Company", quote.company]);
  rows.push(["Phone", quote.phone], ["Email", quote.email]);
  if (product) rows.push(["Product", product.name]);
  if (forProduct) rows.push(["For robot", forProduct.name]);
  if (quote.interest) rows.push(["Robot", INTEREST_LABEL[quote.interest]]);
  if (quote.interest === "lawn-mowing") {
    rows.push(["Lawn area (m²)", quote.areaM2]);
  }
  if (quote.interest === "pudu-delivery") {
    rows.push(
      ["Venue", quote.venue ? VENUE_LABEL[quote.venue] : ""],
      ["Tables or rooms", quote.servingCount],
      ["Floors", quote.floors]
    );
  }
  if (quote.note) rows.push(["Note", quote.note]);

  const body = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-size:13px;color:#6b7280;width:120px;vertical-align:top;">${label}</td><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-size:14px;color:#1a1a1a;">${esc(value).replace(/\n/g, "<br>")}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html><html><body style="margin:0;padding:24px 12px;background:#f4f5f6;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin:0 auto;background:#ffffff;border-radius:12px;">
<tr><td style="height:6px;background:#F5C842;border-radius:12px 12px 0 0;"></td></tr>
<tr><td style="padding:24px 28px 8px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#8a6a00;font-weight:700;">Quotation request</td></tr>
<tr><td style="padding:0 28px 8px;font-size:20px;font-weight:700;color:#17181b;">${esc(quote.fullName)}</td></tr>
<tr><td style="padding:8px 28px 28px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${body}</table>
<p style="margin:16px 0 0;font-size:13px;"><a href="tel:${esc(quote.phone.replace(/[^\d+]/g, ""))}" style="color:#17181b;">Call ${esc(quote.phone)}</a></p>
</td></tr></table></body></html>`;
}

/**
 * The quote form, from the homepage card or the quote panel a product's button
 * opens. Contact details plus the robot they want quoted.
 */
export async function POST(request: Request) {
  const limited = enforce(request, "quote", 5, 10 * MINUTE);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const quote = asQuote(body.quote);

  // A product id from the browser is only a hint: keep it only if it is in the
  // catalogue, so the email never names something we don't sell.
  let product: Product | undefined;
  let forProduct: Product | undefined;
  if (quote.productId) {
    const byId = new Map((await getAllProducts()).map((p) => [p.id, p]));
    product = byId.get(quote.productId);
    forProduct = quote.forId ? byId.get(quote.forId) : undefined;
  }
  if (!product) quote.productId = "";
  if (!forProduct) quote.forId = "";

  const errors = validateQuote(quote, { productChosen: !!product });
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Invalid details", errors }, { status: 400 });
  }

  const locale =
    typeof body.locale === "string" &&
    (routing.locales as readonly string[]).includes(body.locale)
      ? body.locale
      : routing.defaultLocale;

  if (!emailConfigured) {
    console.warn("[quotes] RESEND_API_KEY not set — quote not emailed", {
      locale,
      name: quote.fullName,
      phone: quote.phone,
      email: quote.email,
      interest: quote.interest,
      product: product?.id,
    });
    return NextResponse.json({ ok: true, emailed: false });
  }

  const sent = await sendEmail({
    to: salesAlertRecipients,
    subject: `Quotation request — ${quote.fullName}${product ? ` — ${product.name}` : ""}`,
    html: quoteEmail(quote, product, forProduct),
    replyTo: quote.email,
  });

  if (!sent) {
    return NextResponse.json({ error: "send_failed" }, { status: 503 });
  }

  return NextResponse.json({ ok: true, emailed: true });
}

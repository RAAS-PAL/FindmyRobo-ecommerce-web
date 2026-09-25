import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { asShipping, validateShipping, type ShippingInfo } from "@/lib/checkout";
import { emailConfigured, salesAlertRecipients, sendEmail } from "@/lib/email";
import { enforce, MINUTE } from "@/lib/rateLimit";

const esc = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function quoteEmail(shipping: ShippingInfo): string {
  const rows: [string, string][] = [
    ["Name", shipping.fullName],
    ["Phone", shipping.phone],
    ["Email", shipping.email],
    ["Address", shipping.address],
    ["District", shipping.district],
    ["Province", shipping.province],
    ["Postal code", shipping.postalCode],
  ];
  if (shipping.note) rows.push(["Note", shipping.note]);

  const body = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-size:13px;color:#6b7280;width:120px;vertical-align:top;">${label}</td><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;font-size:14px;color:#1a1a1a;">${esc(value)}</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html><html><body style="margin:0;padding:24px 12px;background:#f4f5f6;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin:0 auto;background:#ffffff;border-radius:12px;">
<tr><td style="height:6px;background:#F5C842;border-radius:12px 12px 0 0;"></td></tr>
<tr><td style="padding:24px 28px 8px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#8a6a00;font-weight:700;">Homepage quotation</td></tr>
<tr><td style="padding:0 28px 8px;font-size:20px;font-weight:700;color:#17181b;">${esc(shipping.fullName)}</td></tr>
<tr><td style="padding:8px 28px 28px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${body}</table>
<p style="margin:16px 0 0;font-size:13px;"><a href="tel:${esc(shipping.phone.replace(/[^\d+]/g, ""))}" style="color:#17181b;">Call ${esc(shipping.phone)}</a></p>
</td></tr></table></body></html>`;
}

/** Homepage quote card. Same contact fields as checkout, with no cart. */
export async function POST(request: Request) {
  const limited = enforce(request, "quote", 5, 10 * MINUTE);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const shipping = asShipping(body.shipping);
  const errors = validateShipping(shipping);
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
      name: shipping.fullName,
      phone: shipping.phone,
      email: shipping.email,
    });
    return NextResponse.json({ ok: true, emailed: false });
  }

  const sent = await sendEmail({
    to: salesAlertRecipients,
    subject: `Quotation request — ${shipping.fullName}`,
    html: quoteEmail(shipping),
    replyTo: shipping.email,
  });

  if (!sent) {
    return NextResponse.json({ error: "send_failed" }, { status: 503 });
  }

  return NextResponse.json({ ok: true, emailed: true });
}

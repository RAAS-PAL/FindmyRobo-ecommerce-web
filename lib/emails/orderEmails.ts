import { getTranslations } from "next-intl/server";
import { formatBaht } from "@/data/products";
import { siteConfig } from "@/data/siteConfig";
import { siteUrl } from "@/lib/siteUrl";
import type { Order } from "@/lib/checkout";

/**
 * HTML builders for the two order emails.
 *
 * Written as tables with inline styles on purpose — Gmail, Outlook, and the
 * LINE in-app browser all strip <style> blocks and ignore flexbox, so anything
 * more modern silently collapses into an unreadable column on someone's phone.
 */

const GOLD = "#F5C842";
const FOREST = "#0A2E1F";
const INK = "#1a1a1a";
const MUTED = "#6b7280";
const BORDER = "#e5e7eb";

const esc = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Digits only — `tel:` links break on spaces and dashes. */
const telHref = (phone: string) => phone.replace(/[^\d+]/g, "");

function shell(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f4f5f6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f6;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
${bodyHtml}
</table>
</td></tr></table>
</body></html>`;
}

function itemRows(order: Order): string {
  return order.items
    .map(
      (line) => `<tr>
<td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-size:14px;color:${INK};">
  ${esc(line.name)}${line.forName ? `<br><span style="font-size:12px;color:${MUTED};">↳ ${esc(line.forName)}</span>` : ""}
</td>
<td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-size:14px;color:${MUTED};text-align:center;white-space:nowrap;">×${line.qty}</td>
<td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-size:14px;color:${INK};text-align:right;white-space:nowrap;">${formatBaht(line.qty * line.unitPrice)}</td>
</tr>`
    )
    .join("");
}

function addressBlock(order: Order): string {
  const s = order.shipping;
  return `${esc(s.address)}<br>${esc(s.district)}, ${esc(s.province)} ${esc(s.postalCode)}`;
}

/**
 * Internal alert. Built as a work order, not a marketing email: the sales team
 * opens it on a phone and the first thing they should be able to do is tap the
 * customer's number, because the whole launch model is "we call them back".
 */
export async function buildSalesAlert(
  order: Order,
  locale: string
): Promise<{ subject: string; html: string }> {
  const t = await getTranslations({ locale, namespace: "emails.salesAlert" });
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const adminUrl = `${origin}/admin/orders/${order.id}`;
  const s = order.shipping;

  const html = shell(`
<tr><td style="background:${FOREST};padding:20px 28px;">
  <div style="color:${GOLD};font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;">${esc(t("eyebrow"))}</div>
  <div style="color:#ffffff;font-size:22px;font-weight:bold;margin-top:4px;">${esc(order.id)}</div>
</td></tr>

<tr><td style="padding:24px 28px 8px;">
  <div style="font-size:12px;color:${MUTED};text-transform:uppercase;letter-spacing:1px;">${esc(t("callNow"))}</div>
  <a href="tel:${telHref(s.phone)}" style="display:block;margin-top:6px;font-size:30px;font-weight:bold;color:${FOREST};text-decoration:none;">${esc(s.phone)}</a>
  <div style="margin-top:6px;font-size:15px;color:${INK};">${esc(s.fullName)}</div>
  <div style="font-size:13px;color:${MUTED};">${esc(s.email)}</div>
</td></tr>

<tr><td style="padding:16px 28px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${itemRows(order)}
    <tr>
      <td colspan="2" style="padding:12px 0;font-size:15px;font-weight:bold;color:${INK};">${esc(t("total"))}</td>
      <td style="padding:12px 0;font-size:18px;font-weight:bold;color:${INK};text-align:right;">${formatBaht(order.total)}</td>
    </tr>
  </table>
</td></tr>

<tr><td style="padding:8px 28px 0;">
  <div style="font-size:12px;color:${MUTED};text-transform:uppercase;letter-spacing:1px;">${esc(t("deliverTo"))}</div>
  <div style="margin-top:4px;font-size:14px;color:${INK};line-height:1.6;">${addressBlock(order)}</div>
  ${s.note ? `<div style="margin-top:10px;padding:10px 12px;background:#fffbeb;border-left:3px solid ${GOLD};font-size:13px;color:${INK};"><strong>${esc(t("note"))}:</strong> ${esc(s.note)}</div>` : ""}
</td></tr>

<tr><td style="padding:24px 28px 28px;">
  <a href="${adminUrl}" style="display:inline-block;background:${GOLD};color:${FOREST};font-size:14px;font-weight:bold;text-decoration:none;padding:13px 26px;border-radius:999px;">${esc(t("openAdmin"))}</a>
</td></tr>`);

  return {
    subject: t("subject", { orderId: order.id, name: s.fullName }),
    html,
  };
}

/**
 * Customer receipt. Deliberately does NOT say "payment received" — under the
 * current launch model the order is pending_payment and a human settles it by
 * phone, so the copy has to set that expectation or people will assume they
 * have paid and wonder why nothing shipped.
 */
export async function buildCustomerConfirmation(
  order: Order,
  locale: string
): Promise<{ subject: string; html: string }> {
  const t = await getTranslations({ locale, namespace: "emails.orderConfirmation" });
  const { phone, email } = siteConfig.salesContact;
  // Guests have no account page, so the tracking link in this email is the
  // only way back to their order.
  const trackUrl = `${siteUrl}${locale === "th" ? "" : `/${locale}`}/order-status`;

  const html = shell(`
<tr><td style="background:${FOREST};padding:24px 28px;text-align:center;">
  <div style="color:#ffffff;font-size:20px;font-weight:bold;">FindMy<span style="color:${GOLD};">Robo</span></div>
</td></tr>

<tr><td style="padding:28px 28px 0;">
  <h1 style="margin:0;font-size:22px;color:${INK};">${esc(t("heading"))}</h1>
  <p style="margin:10px 0 0;font-size:15px;color:${INK};line-height:1.6;">${esc(t("intro", { name: order.shipping.fullName }))}</p>
  <div style="margin-top:16px;padding:12px 16px;background:#f9fafb;border-radius:8px;">
    <span style="font-size:12px;color:${MUTED};">${esc(t("orderNumber"))}</span><br>
    <strong style="font-size:17px;color:${INK};letter-spacing:0.5px;">${esc(order.id)}</strong>
  </div>
</td></tr>

<tr><td style="padding:20px 28px 0;">
  <div style="padding:16px;border:1px solid ${GOLD};border-radius:8px;background:#fffbeb;">
    <div style="font-size:14px;font-weight:bold;color:${INK};">${esc(t("nextTitle"))}</div>
    <div style="margin-top:6px;font-size:13.5px;color:${INK};line-height:1.7;">${esc(t("nextBody", { phone: order.shipping.phone }))}</div>
  </div>
</td></tr>

<tr><td style="padding:22px 28px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${itemRows(order)}
    <tr>
      <td colspan="2" style="padding:12px 0;font-size:15px;font-weight:bold;color:${INK};">${esc(t("total"))}</td>
      <td style="padding:12px 0;font-size:18px;font-weight:bold;color:${INK};text-align:right;">${formatBaht(order.total)}</td>
    </tr>
  </table>
</td></tr>

<tr><td style="padding:6px 28px 0;">
  <div style="font-size:12px;color:${MUTED};text-transform:uppercase;letter-spacing:1px;">${esc(t("deliverTo"))}</div>
  <div style="margin-top:4px;font-size:14px;color:${INK};line-height:1.6;">${esc(order.shipping.fullName)}<br>${addressBlock(order)}</div>
</td></tr>

<tr><td style="padding:22px 28px 0;">
  <a href="${trackUrl}" style="display:inline-block;background:${GOLD};color:${FOREST};font-size:14px;font-weight:bold;text-decoration:none;padding:13px 26px;border-radius:999px;">${esc(t("trackCta"))}</a>
</td></tr>

<tr><td style="padding:24px 28px 28px;">
  <div style="border-top:1px solid ${BORDER};padding-top:16px;font-size:13px;color:${MUTED};line-height:1.7;">
    ${esc(t("helpTitle"))}<br>
    <a href="tel:${telHref(phone)}" style="color:${FOREST};font-weight:bold;text-decoration:none;">${esc(phone)}</a> ·
    <a href="mailto:${esc(email)}" style="color:${FOREST};font-weight:bold;text-decoration:none;">${esc(email)}</a>
  </div>
</td></tr>`);

  return {
    subject: t("subject", { orderId: order.id }),
    html,
  };
}

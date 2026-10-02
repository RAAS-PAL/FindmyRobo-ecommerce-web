import { NextResponse } from "next/server";
import { emailConfigured, salesAlertRecipients, sendEmail } from "@/lib/email";
import { getAllProducts } from "@/lib/productStore";
import { enforce, MINUTE } from "@/lib/rateLimit";
import { asAnswers, recommend } from "@/lib/recommend";
import {
  asContact,
  asLocale,
  recommendEmail,
  validateContact,
} from "@/lib/recommendRequest";
import { createServiceClient } from "@/lib/supabase/service";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * "Send me this and have sales contact me", under the results. Needs the
 * customer's consent. Attaches the contact to the saved questionnaire (once:
 * a row that already has contact details is never overwritten), or saves a
 * new one when the first save failed, then emails sales.
 */
export async function POST(request: Request) {
  const limited = enforce(request, "recommend-contact", 5, 10 * MINUTE);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const answers = asAnswers(body.answers);
  if (!answers) return NextResponse.json({ error: "Invalid answers" }, { status: 400 });

  const contact = asContact(body.contact);
  const consent = body.consent === true;
  const errors = validateContact(contact, consent);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Invalid details", errors }, { status: 400 });
  }

  const matches = recommend(await getAllProducts(), answers);
  const locale = asLocale(body.locale);
  const fields = {
    contact_name: contact.name,
    contact_phone: contact.phone,
    contact_email: contact.email || null,
    contact_note: contact.note || null,
    consent_at: new Date().toISOString(),
  };

  let saved = false;
  try {
    const db = createServiceClient().from("recommendation_requests");
    const id = typeof body.id === "string" && UUID_RE.test(body.id) ? body.id : null;
    if (id) {
      const { data, error } = await db
        .update(fields)
        .eq("id", id)
        .is("contact_name", null)
        .select("id");
      if (error) throw error;
      saved = (data ?? []).length > 0;
    }
    if (!saved) {
      const { error } = await db.insert({
        locale,
        answers,
        results: matches.map((m) => m.product.id),
        ...fields,
      });
      if (error) throw error;
      saved = true;
    }
  } catch (error) {
    console.warn("[recommend] contact not saved (is add-recommender.sql applied?)", error);
  }

  if (!emailConfigured) {
    console.warn("[recommend] RESEND_API_KEY not set — lead not emailed", {
      saved,
      name: contact.name,
      phone: contact.phone,
    });
    // nothing reached sales at all: say so rather than pretend
    if (!saved) return NextResponse.json({ error: "send_failed" }, { status: 503 });
    return NextResponse.json({ ok: true, emailed: false });
  }

  const sent = await sendEmail({
    to: salesAlertRecipients,
    subject: `Robot recommendation — ${contact.name}`,
    html: recommendEmail(contact, answers, matches),
    ...(contact.email ? { replyTo: contact.email } : {}),
  });
  if (!sent && !saved) {
    return NextResponse.json({ error: "send_failed" }, { status: 503 });
  }
  return NextResponse.json({ ok: true, emailed: sent });
}

import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/productStore";
import { asAnswers, recommend } from "@/lib/recommend";
import { createServiceClient } from "@/lib/supabase/service";
import { enforce, MINUTE } from "@/lib/rateLimit";
import { asLocale } from "@/lib/recommendRequest";

/**
 * A finished questionnaire on /recommend. Ranks the catalogue on the server
 * (the browser's own ranking is only for display) and saves the answers and
 * the robots shown to recommendation_requests, without contact details —
 * those come later, only if the customer sends them (./contact).
 *
 * Saving is best-effort: if the table isn't there yet the customer still gets
 * the results, just with no id to attach contact details to.
 */
export async function POST(request: Request) {
  const limited = enforce(request, "recommend", 20, 10 * MINUTE);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const answers = asAnswers(body.answers);
  if (!answers) return NextResponse.json({ error: "Invalid answers" }, { status: 400 });

  const results = recommend(await getAllProducts(), answers).map((m) => m.product.id);

  let id: string | null = null;
  try {
    const { data, error } = await createServiceClient()
      .from("recommendation_requests")
      .insert({ locale: asLocale(body.locale), answers, results })
      .select("id")
      .single();
    if (error) throw error;
    id = data.id;
  } catch (error) {
    console.warn("[recommend] not saved (is add-recommender.sql applied?)", error);
  }

  return NextResponse.json({ id, results });
}

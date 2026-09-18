import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProductById } from "@/lib/productStore";
import { enforce, MINUTE } from "@/lib/rateLimit";
import {
  getReviewSummary,
  getUserReview,
  hasPurchased,
  listReviews,
  upsertReview,
  type ReviewSort,
} from "@/lib/reviewStore";

const SORTS: ReviewSort[] = ["recent", "highest", "lowest"];

/** The signed-in customer (id + display name), or null. */
async function getViewer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email")
    .eq("id", user.id)
    .maybeSingle();

  let name = (
    profile?.full_name ||
    (user.user_metadata?.full_name as string | undefined) ||
    profile?.email ||
    user.email ||
    ""
  ).trim();
  if (name.includes("@")) name = name.split("@")[0];
  if (!name) name = "Customer";
  return { id: user.id, name: name.slice(0, 60) };
}

/** Public: reviews + summary for a product, plus the viewer's own review. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "missing_product" }, { status: 400 });
  }
  const sortParam = searchParams.get("sort");
  const sort: ReviewSort = SORTS.includes(sortParam as ReviewSort)
    ? (sortParam as ReviewSort)
    : "recent";
  const offset = Math.max(0, Math.floor(Number(searchParams.get("offset")) || 0));

  const viewer = await getViewer();
  try {
    const [summary, page, yourReview] = await Promise.all([
      getReviewSummary(productId),
      listReviews(productId, { sort, offset }),
      viewer ? getUserReview(productId, viewer.id) : Promise.resolve(null),
    ]);

    // Flag the viewer's own review within the list so the UI can label it.
    const reviews = page.reviews.map((r) =>
      yourReview && r.id === yourReview.id ? { ...r, mine: true } : r
    );

    return NextResponse.json({
      summary,
      reviews,
      total: page.total,
      viewer: { loggedIn: !!viewer },
      yourReview,
    });
  } catch (error) {
    // Degrade to an empty state so the product page still renders — but say
    // so. This block ran silently for months while the reviews table did not
    // exist: every product showed "no reviews yet", returned 200, and nothing
    // was logged, so nobody knew the feature was dead. A degraded fallback is
    // fine; an invisible one is how a missing table hides in production.
    console.error(`[reviews] falling back to empty state for ${productId}:`, error);
    return NextResponse.json({
      summary: { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
      reviews: [],
      total: 0,
      viewer: { loggedIn: !!viewer },
      yourReview: null,
    });
  }
}

/** Create or edit the signed-in customer's review for a product. */
export async function POST(request: Request) {
  const limited = enforce(request, "reviews", 5, 10 * MINUTE);
  if (limited) return limited;

  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const productId = typeof body.productId === "string" ? body.productId : "";
  const product = productId ? await getProductById(productId) : undefined;
  if (!product || product.visible === false) {
    return NextResponse.json({ error: "product_not_found" }, { status: 404 });
  }

  const rating = Math.floor(Number(body.rating));
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "invalid_rating" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (title.length < 3 || title.length > 120) {
    return NextResponse.json({ error: "invalid_title" }, { status: 400 });
  }

  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (text.length < 10 || text.length > 2000) {
    return NextResponse.json({ error: "invalid_review" }, { status: 400 });
  }

  try {
    const verified = await hasPurchased(viewer.id, productId);
    const review = await upsertReview({
      productId,
      userId: viewer.id,
      authorName: viewer.name,
      rating,
      title,
      body: text,
      verified,
    });
    const summary = await getReviewSummary(productId);
    return NextResponse.json({ review, summary }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "server" },
      { status: 500 }
    );
  }
}

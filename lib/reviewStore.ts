import { createServiceClient } from "@/lib/supabase/service";

/**
 * Supabase-backed product reviews (see supabase/reviews-schema.sql). Mirrors
 * lib/orderStore.ts: all access goes through the service-role client, with auth
 * enforced by the /api/reviews route before any write. One review per customer
 * per product (upsert lets them edit).
 */

const TABLE = "reviews";
export const REVIEW_PAGE_SIZE = 8;

export type ReviewSort = "recent" | "highest" | "lowest";

export interface Review {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  createdAt: string;
  /** Only exposed to the review's own author (drives the "edit" affordance). */
  mine?: boolean;
}

export interface ReviewSummary {
  average: number; // 0–5, two decimals
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

interface ReviewRow {
  id: string;
  product_id: string;
  user_id: string;
  author_name: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
  created_at: string;
}

function rowToReview(r: ReviewRow): Review {
  return {
    id: r.id,
    productId: r.product_id,
    authorName: r.author_name,
    rating: r.rating,
    title: r.title,
    body: r.body,
    verified: r.verified,
    createdAt: r.created_at,
  };
}

export async function getReviewSummary(productId: string): Promise<ReviewSummary> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("rating")
    .eq("product_id", productId)
    .eq("visible", true);
  if (error) throw new Error(`Failed to load review summary: ${error.message}`);

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as ReviewSummary["distribution"];
  let sum = 0;
  for (const row of data ?? []) {
    const r = row.rating as 1 | 2 | 3 | 4 | 5;
    if (distribution[r] != null) distribution[r] += 1;
    sum += row.rating;
  }
  const count = data?.length ?? 0;
  const average = count ? Math.round((sum / count) * 100) / 100 : 0;
  return { average, count, distribution };
}

export async function listReviews(
  productId: string,
  { sort = "recent", offset = 0, limit = REVIEW_PAGE_SIZE }: { sort?: ReviewSort; offset?: number; limit?: number } = {}
): Promise<{ reviews: Review[]; total: number }> {
  const supabase = createServiceClient();
  let query = supabase
    .from(TABLE)
    .select("*", { count: "exact" })
    .eq("product_id", productId)
    .eq("visible", true);

  if (sort === "highest") query = query.order("rating", { ascending: false }).order("created_at", { ascending: false });
  else if (sort === "lowest") query = query.order("rating", { ascending: true }).order("created_at", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data, error, count } = await query.range(offset, offset + limit - 1);
  if (error) throw new Error(`Failed to load reviews: ${error.message}`);
  return { reviews: (data ?? []).map(rowToReview), total: count ?? 0 };
}

export async function getUserReview(productId: string, userId: string): Promise<Review | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("product_id", productId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`Failed to load your review: ${error.message}`);
  if (!data) return null;
  return { ...rowToReview(data), mine: true };
}

/** True when the user has any order that includes this product (drives "Verified"). */
export async function hasPurchased(userId: string, productId: string): Promise<boolean> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("orders").select("items").eq("user_id", userId);
  if (error || !data) return false;
  return data.some(
    (order) =>
      Array.isArray(order.items) &&
      order.items.some((item: { id?: string }) => item && item.id === productId)
  );
}

export async function upsertReview(input: {
  productId: string;
  userId: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  verified: boolean;
}): Promise<Review> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      {
        product_id: input.productId,
        user_id: input.userId,
        author_name: input.authorName,
        rating: input.rating,
        title: input.title,
        body: input.body,
        verified: input.verified,
      },
      { onConflict: "product_id,user_id" }
    )
    .select("*")
    .single();
  if (error) throw new Error(`Failed to save review: ${error.message}`);
  return { ...rowToReview(data), mine: true };
}

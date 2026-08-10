import { NextResponse } from "next/server";

/**
 * Small fixed-window rate limiter for the public API routes.
 *
 * SCOPE, honestly stated: the counters live in the memory of one serverless
 * instance, so a determined attacker spreading requests across instances gets
 * more than `limit`. It is not a distributed limiter and does not pretend to
 * be one. What it does reliably stop is the common case — one script hammering
 * one endpoint, which is what burns the Resend quota and fills the orders
 * table with junk.
 *
 * When that stops being enough, swap the Map for Upstash Redis; `check()` is
 * the only function that needs to change.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();

/** Drop expired buckets occasionally so the Map can't grow without bound. */
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the window resets. */
  retryAfter: number;
}

export function check(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfter: 0 };
}

/**
 * Best-effort client identity. On Vercel `x-forwarded-for` is set by the edge
 * and its first entry is the real client; locally it is absent, so everything
 * shares one bucket, which is fine for development.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Guards a route. Returns a 429 response to return immediately, or null to
 * carry on.
 *
 *   const limited = enforce(request, "checkout", 10, 10 * 60_000);
 *   if (limited) return limited;
 */
export function enforce(
  request: Request,
  name: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const { ok, retryAfter } = check(`${name}:${clientIp(request)}`, limit, windowMs);
  if (ok) return null;

  return NextResponse.json(
    { error: "rate_limited", retryAfter },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}

export const MINUTE = 60_000;

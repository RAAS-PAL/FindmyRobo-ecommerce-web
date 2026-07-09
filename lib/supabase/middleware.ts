import { createServerClient } from "@supabase/ssr";
import { type NextRequest, type NextResponse } from "next/server";

/**
 * Refreshes the Supabase auth session on the given response, keeping the
 * user's cookies alive. Bound to an already-created response so it can layer
 * on top of the next-intl middleware response.
 *
 * This runs on EVERY request (see middleware.ts matcher), so it must never
 * throw: a missing/misconfigured Supabase env var would otherwise 500 the
 * entire site instead of just degrading auth. Falls through to the
 * unmodified response — visitors stay logged out rather than seeing errors.
 */
export async function updateSession(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.error(
      "Supabase env vars missing — auth disabled for this request (site still serves)"
    );
    return response;
  }

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // Touch the user to trigger a token refresh when needed. Do not run code
    // between createServerClient and getUser (Supabase SSR guidance).
    await supabase.auth.getUser();
  } catch (err) {
    console.error("Supabase session refresh failed:", err);
  }

  return response;
}

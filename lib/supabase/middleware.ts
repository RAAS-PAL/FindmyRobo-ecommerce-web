import { createServerClient } from "@supabase/ssr";
import { type NextRequest, type NextResponse } from "next/server";

/**
 * Refreshes the Supabase auth session on the given response, keeping the
 * user's cookies alive. Bound to an already-created response so it can layer
 * on top of the next-intl middleware response.
 */
export async function updateSession(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
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
    }
  );

  // Touch the user to trigger a token refresh when needed. Do not run code
  // between createServerClient and getUser (Supabase SSR guidance).
  await supabase.auth.getUser();

  return response;
}

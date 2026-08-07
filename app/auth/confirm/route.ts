import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Only same-origin relative paths may be redirected to. `next` arrives from a
 * link in an email, so an attacker-supplied value must not be able to send the
 * visitor off-site: "@evil.com" would make `${origin}${next}` resolve to
 * https://evil.com with our domain as the userinfo part, and "//evil.com" is
 * protocol-relative. Both look like our link right up until they aren't.
 */
function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/account";
  return raw;
}

/**
 * Email-confirmation callback. Supabase sends the customer a link here after
 * signup; we verify the token and drop them into their account.
 * Handles both the token_hash (recommended) and PKCE code flows.
 *
 * Password recovery uses the same route — the reset email points here with
 * type=recovery and next=/reset-password, so verifying the token establishes
 * the session that /reset-password needs to set a new password.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=confirm`);
}

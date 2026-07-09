import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for browser / client components (signup, login forms).
 * Uses the publishable key — safe to expose to the browser.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

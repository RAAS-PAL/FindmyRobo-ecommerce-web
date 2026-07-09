import { createClient } from "@supabase/supabase-js";

/**
 * Admin/service client using the SECRET key. Bypasses row-level security —
 * server-only, never import into a client component. Used for privileged
 * reads/writes like counting all registered users.
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

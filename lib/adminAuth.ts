import { createClient } from "@/lib/supabase/server";

/**
 * Admin access is now role-based via Supabase: a signed-in user whose
 * profile.role = 'admin'. Same export name as before so the admin layout and
 * product API routes need no changes.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "admin";
}

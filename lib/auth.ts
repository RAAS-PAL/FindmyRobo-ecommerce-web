import { createClient } from "@/lib/supabase/server";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "user" | "admin";
  created_at: string;
}

/** The signed-in user's profile row, or null if not logged in. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (data as Profile) ?? null;
}

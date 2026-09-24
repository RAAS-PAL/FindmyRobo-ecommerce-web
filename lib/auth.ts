import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  marketing_opt_in: boolean;
  role: "user" | "admin" | "marketing";
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

/** Fields a customer is allowed to change about themselves. */
export interface ProfileInput {
  fullName: string;
  phone: string | null;
  marketingOptIn: boolean;
}

const PHONE_RE = /^[0-9+\-\s()]{6,20}$/;

/**
 * Validates a profile payload. Returns the cleaned value, or an error key the
 * UI turns into a translated message.
 */
export function parseProfileInput(raw: unknown): ProfileInput | string {
  if (typeof raw !== "object" || raw === null) return "invalid_body";
  const body = raw as Record<string, unknown>;

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  if (fullName.length < 1 || fullName.length > 80) return "invalid_name";

  const rawPhone = typeof body.phone === "string" ? body.phone.trim() : "";
  if (rawPhone && !PHONE_RE.test(rawPhone)) return "invalid_phone";

  return {
    fullName,
    phone: rawPhone || null,
    marketingOptIn: body.marketingOptIn === true,
  };
}

/**
 * Updates the signed-in customer's own profile. `role` is never written here,
 * and the database refuses it anyway — column-level grants (see
 * supabase/add-profile-fields.sql) only allow the three columns below.
 */
export async function updateOwnProfile(input: ProfileInput): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");

  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName,
      phone: input.phone,
      marketing_opt_in: input.marketingOptIn,
    })
    .eq("id", user.id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  // Keep the auth user_metadata copy of the name in step, since the signup
  // trigger seeds profiles.full_name from it and other surfaces read it.
  await supabase.auth.updateUser({ data: { full_name: input.fullName } });

  return data as Profile;
}

/**
 * Permanently deletes the signed-in customer's account.
 *
 * Deleting the auth user is enough: profiles, addresses, and reviews cascade,
 * while orders.user_id is ON DELETE SET NULL so the sales record survives with
 * the personal link severed. That split is deliberate — PDPA erasure does not
 * override the legal duty to retain accounting records.
 */
export async function deleteOwnAccount(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthenticated");

  // Deleting a user needs admin rights, so this uses the service key — but the
  // id comes from the verified session, never from the request body. A caller
  // can only ever delete themselves.
  const service = createServiceClient();
  const { error } = await service.auth.admin.deleteUser(user.id);
  if (error) throw new Error(error.message);
}

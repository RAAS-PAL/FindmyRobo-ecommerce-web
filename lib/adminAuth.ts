import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin-panel access is role-based via Supabase profiles.role:
 *
 *   admin      everything — products, prices, orders, fulfilment, content
 *   marketing  Admin → Content only (homepage, About, contact, SEO text)
 *
 * The split is enforced where it matters — every admin API route checks the
 * role itself — not just by which tabs the panel shows. Product and order
 * routes call isAdminAuthenticated(); content routes call getStaffUser().
 */

export type StaffRole = "admin" | "marketing";

export interface StaffUser {
  id: string;
  email: string | null;
  role: StaffRole;
}

/** The signed-in staff member, or null for visitors and customers. Cached per request. */
export const getStaffUser = cache(async (): Promise<StaffUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;
  if (role !== "admin" && role !== "marketing") return null;
  return { id: user.id, email: user.email ?? null, role };
});

/** Full admin only. Guards products, orders, fulfilment and their API routes. */
export async function isAdminAuthenticated(): Promise<boolean> {
  return (await getStaffUser())?.role === "admin";
}

import { redirect } from "next/navigation";
import { getStaffUser } from "@/lib/adminAuth";

/**
 * Products, orders and fulfilment: admin only. The marketing role is sent to
 * the one section it can edit rather than shown a page it cannot use. (The API
 * routes behind these pages check the role themselves as well — this layout is
 * the courtesy, not the lock.)
 */
export default async function AdminOnlyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const staff = await getStaffUser();
  if (!staff) redirect("/admin/login");
  if (staff.role !== "admin") redirect("/admin/content");
  return <div className="mx-auto w-full max-w-6xl">{children}</div>;
}

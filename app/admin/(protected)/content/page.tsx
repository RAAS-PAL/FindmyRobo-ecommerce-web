import { redirect } from "next/navigation";

/** The Content tab opens on its first section. */
export default function ContentIndexPage() {
  redirect("/admin/content/home");
}

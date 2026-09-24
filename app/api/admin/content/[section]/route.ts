import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getStaffUser } from "@/lib/adminAuth";
import { isContentSection } from "@/data/siteContent";
import { ContentTableMissingError, saveSection } from "@/lib/siteContentStore";
import { parseSection } from "@/lib/siteContentValidation";

/**
 * Publish one Content section (home, announcement, about, contact, seo).
 * Admin and marketing may both call this; the body is validated in full
 * before it is stored, and every page is regenerated so the change is live on
 * the next visit — no deploy.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ section: string }> }
) {
  const staff = await getStaffUser();
  if (!staff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { section } = await params;
  if (!isContentSection(section)) {
    return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseSection(section, body);
  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  try {
    const { updatedAt } = await saveSection(section, parsed, staff);
    // Content shows on every page (announcement, footer, SEO), so everything
    // is regenerated — the same scope a product save uses.
    revalidatePath("/", "layout");
    // The cleaned content goes back so the editor shows exactly what is live.
    return NextResponse.json({ ok: true, updatedAt, content: parsed });
  } catch (e) {
    if (e instanceof ContentTableMissingError) {
      return NextResponse.json({ error: e.message, code: "table_missing" }, { status: 503 });
    }
    console.error(`Content save failed (${section}):`, e);
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }
}

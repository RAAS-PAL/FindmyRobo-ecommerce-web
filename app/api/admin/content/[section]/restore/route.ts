import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getStaffUser } from "@/lib/adminAuth";
import { isContentSection } from "@/data/siteContent";
import {
  ContentTableMissingError,
  getRevisionContent,
  saveSection,
} from "@/lib/siteContentStore";
import { parseSection } from "@/lib/siteContentValidation";

/**
 * Put an earlier version of a section back live. It is saved as a NEW version,
 * so the history keeps the version being replaced and a restore can itself
 * be undone.
 *
 * The old content goes through the same validation as a normal save: it was
 * valid when it was written, but the rules may have tightened since.
 */
export async function POST(
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

  let revisionId: number;
  try {
    revisionId = Number((await request.json()).revisionId);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!Number.isSafeInteger(revisionId) || revisionId <= 0) {
    return NextResponse.json({ error: "Invalid revision" }, { status: 400 });
  }

  try {
    const stored = await getRevisionContent(section, revisionId);
    if (stored === null) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }
    const parsed = parseSection(section, stored);
    if (typeof parsed === "string") {
      return NextResponse.json(
        { error: `That version no longer passes validation — ${parsed}` },
        { status: 422 }
      );
    }
    const { updatedAt } = await saveSection(section, parsed, staff);
    revalidatePath("/", "layout");
    // The cleaned content goes back so the editor shows exactly what is live.
    return NextResponse.json({ ok: true, updatedAt, content: parsed });
  } catch (e) {
    if (e instanceof ContentTableMissingError) {
      return NextResponse.json({ error: e.message, code: "table_missing" }, { status: 503 });
    }
    console.error(`Content restore failed (${section} #${revisionId}):`, e);
    return NextResponse.json({ error: "Could not restore" }, { status: 500 });
  }
}

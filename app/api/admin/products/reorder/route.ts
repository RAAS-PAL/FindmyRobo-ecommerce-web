import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { reorderProducts } from "@/lib/productStore";

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let ids: unknown;
  try {
    ({ ids } = (await request.json()) as { ids?: unknown });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (
    !Array.isArray(ids) ||
    ids.length === 0 ||
    ids.some((id) => typeof id !== "string" || !id) ||
    new Set(ids).size !== ids.length
  ) {
    return NextResponse.json(
      { error: "Order must contain unique product ids" },
      { status: 400 }
    );
  }

  try {
    await reorderProducts(ids);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save order" },
      { status: 400 }
    );
  }

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}

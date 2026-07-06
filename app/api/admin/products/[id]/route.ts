import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { deleteProduct } from "@/lib/productStore";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const removed = await deleteProduct(id);
  if (!removed) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}

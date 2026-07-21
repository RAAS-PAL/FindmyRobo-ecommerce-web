import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import {
  deleteProduct,
  setProductVisibility,
  updateProduct,
} from "@/lib/productStore";
import { parseProduct } from "@/lib/productValidation";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // The id comes from the URL and is immutable — product links must not break
  // when the name is edited, so any id in the body is ignored.
  const parsed = parseProduct({ ...body, id });
  if (typeof parsed === "string") {
    return NextResponse.json({ error: parsed }, { status: 400 });
  }

  const updated = await updateProduct(id, parsed);
  if (!updated) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, id });
}

/** Quick storefront show/hide toggle from the product list. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body.visible !== "boolean") {
    return NextResponse.json({ error: "visible must be a boolean" }, { status: 400 });
  }

  const updated = await setProductVisibility(id, body.visible);
  if (!updated) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, id, visible: body.visible });
}

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

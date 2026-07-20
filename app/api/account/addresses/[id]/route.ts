import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  deleteOwnAddress,
  parseAddressInput,
  updateOwnAddress,
} from "@/lib/addressStore";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const address = parseAddressInput(body);
  if (typeof address === "string") {
    return NextResponse.json({ error: address }, { status: 400 });
  }

  try {
    const { id } = await params;
    const saved = await updateOwnAddress(id, address);
    if (!saved) return NextResponse.json({ error: "Address not found" }, { status: 404 });
    revalidatePath("/", "layout");
    return NextResponse.json({ address: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update address";
    return NextResponse.json(
      { error: message },
      { status: message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const removed = await deleteOwnAddress(id);
    if (!removed) return NextResponse.json({ error: "Address not found" }, { status: 404 });
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete address";
    return NextResponse.json(
      { error: message },
      { status: message === "Unauthorized" ? 401 : 500 }
    );
  }
}

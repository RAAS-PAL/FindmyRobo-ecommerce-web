import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  createOwnAddress,
  parseAddressInput,
} from "@/lib/addressStore";
import { enforce, MINUTE } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const limited = enforce(request, "addresses", 30, 10 * MINUTE);
  if (limited) return limited;

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
    const saved = await createOwnAddress(address);
    revalidatePath("/", "layout");
    return NextResponse.json({ address: saved }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save address";
    return NextResponse.json(
      { error: message },
      { status: message === "Unauthorized" ? 401 : 500 }
    );
  }
}

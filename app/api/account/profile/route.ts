import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { parseProfileInput, updateOwnProfile } from "@/lib/auth";

/** Update the signed-in customer's own name, phone, and marketing consent. */
export async function PATCH(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const input = parseProfileInput(body);
  if (typeof input === "string") {
    return NextResponse.json({ error: input }, { status: 400 });
  }

  try {
    const profile = await updateOwnProfile(input);
    revalidatePath("/", "layout");
    return NextResponse.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "server";
    return NextResponse.json(
      { error: message },
      { status: message === "unauthenticated" ? 401 : 500 }
    );
  }
}

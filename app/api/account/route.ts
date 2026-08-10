import { NextResponse } from "next/server";
import { deleteOwnAccount } from "@/lib/auth";

/**
 * Permanently delete the signed-in customer's account (PDPA right to erasure).
 *
 * There is no id in the request on purpose — the account deleted is always the
 * one holding the session, so this endpoint cannot be aimed at anyone else.
 */
export async function DELETE() {
  try {
    await deleteOwnAccount();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "server";
    return NextResponse.json(
      { error: message },
      { status: message === "unauthenticated" ? 401 : 500 }
    );
  }
}

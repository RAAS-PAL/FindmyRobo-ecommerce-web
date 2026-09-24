import type { MigrateUpArgs } from "@payloadcms/db-postgres";
import { seedContent } from "../seed";

/**
 * Fills the CMS with the content the site already had (payload/seed.ts), so
 * editors start from the live copy rather than empty forms. Content, not
 * schema — globals that were already published are left untouched.
 */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  try {
    await seedContent(payload, req);
  } catch (error) {
    // Printed directly: Payload's own logger writes from a worker thread, and
    // the failing migrate exits before it flushes — the first production
    // failure left no error in the build log at all.
    console.error("[cms] content seed failed:", error);
    throw error;
  }
}

/** Nothing to undo: rolling back the schema (initial migration) removes the data. */
export async function down(): Promise<void> {}

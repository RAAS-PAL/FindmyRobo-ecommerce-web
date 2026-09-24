import type { MigrateUpArgs } from "@payloadcms/db-postgres";
import { seedContent } from "../seed";

/**
 * Fills the CMS with the content the site already had (payload/seed.ts), so
 * editors start from the live copy rather than empty forms. Content, not
 * schema — globals that were already published are left untouched.
 */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await seedContent(payload, req);
}

/** Nothing to undo: rolling back the schema (initial migration) removes the data. */
export async function down(): Promise<void> {}

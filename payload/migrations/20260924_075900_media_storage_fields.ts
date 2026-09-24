import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Columns the storage plugin needs on the media table. The initial migration
 * was generated with storage switched off, so it lacked them and the first
 * upload in production failed. Named to run before the content seed, which
 * uploads images. IF NOT EXISTS: harmless on a database that already has them.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."media" ADD COLUMN IF NOT EXISTS "prefix" varchar DEFAULT '';
  ALTER TABLE "payload"."media" ADD COLUMN IF NOT EXISTS "_objectkey" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."media" DROP COLUMN "prefix";
  ALTER TABLE "payload"."media" DROP COLUMN "_objectkey";`)
}

import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { cloudStoragePlugin } from "@payloadcms/plugin-cloud-storage";
import { en } from "@payloadcms/translations/languages/en";
import { th } from "@payloadcms/translations/languages/th";
import sharp from "sharp";
import { Users } from "./payload/collections/Users";
import { Media } from "./payload/collections/Media";
import { Home } from "./payload/globals/Home";
import { Announcement } from "./payload/globals/Announcement";
import { About } from "./payload/globals/About";
import { Contact } from "./payload/globals/Contact";
import { Seo } from "./payload/globals/Seo";
import { supabaseStorage } from "./payload/storage/supabase";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Payload CMS — the website's editable content (homepage, announcement bar,
 * About page, contact details, SEO text) and its media library.
 *
 * Runs inside this Next.js app: the editor is at /cms, its API at /cms-api.
 * (Not the default /admin and /api — those are the Supabase admin panel for
 * products and orders, and the site's own API.)
 *
 * The data lives in the same Supabase Postgres as everything else, but in its
 * own `payload` schema, so Payload's tables can never collide with products,
 * orders or profiles in `public`.
 *
 * The storefront reads the published content through lib/siteContentStore.ts.
 * If DATABASE_URL is not set, the site shows the built-in defaults from
 * data/siteContent.ts instead of failing.
 *
 * Environment:
 *   DATABASE_URL     Supabase Postgres connection string (required for the CMS)
 *   PAYLOAD_SECRET   long random string that signs CMS login sessions
 */
export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || "",
  routes: { admin: "/cms", api: "/cms-api" },

  admin: {
    user: Users.slug,
    meta: { titleSuffix: " — FindMyRobo CMS" },
    importMap: {
      baseDir: path.resolve(dirname),
      importMapFile: path.resolve(dirname, "app/(payload)/cms/importMap.js"),
    },
    livePreview: {
      breakpoints: [
        { name: "mobile", label: "Mobile", width: 390, height: 844 },
        { name: "tablet", label: "Tablet", width: 820, height: 1180 },
        { name: "desktop", label: "Desktop", width: 1440, height: 900 },
      ],
    },
    components: {
      graphics: {
        Logo: "@/payload/components/Brand#Logo",
        Icon: "@/payload/components/Brand#Icon",
      },
    },
  },

  i18n: {
    supportedLanguages: { en, th },
    fallbackLanguage: "en",
  },

  collections: [Users, Media],
  globals: [Home, Announcement, About, Contact, Seo],

  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || "" },
    schemaName: "payload",
    // Schema changes ship as migration files (payload/migrations), applied once
    // per deploy by `pnpm build` (scripts/payload-migrate.mjs) before Next
    // builds. Not `prodMigrations`: that runs on server start, and `next build`
    // starts Payload in ~20 parallel workers, which would race each other.
    // Never auto-push against the live database.
    push: false,
    migrationDir: path.resolve(dirname, "payload/migrations"),
  }),

  sharp,
  graphQL: { disable: true },
  // 4 MB: uploads pass through a Vercel function, and Vercel refuses request
  // bodies over 4.5 MB — a higher limit here would fail there, less clearly.
  upload: { limits: { fileSize: 4 * 1024 * 1024 } },

  plugins: [
    cloudStoragePlugin({
      // PAYLOAD_MEDIA_STORAGE=local keeps uploads on disk — for offline tests
      // against a throwaway database only. Everywhere else, Supabase Storage.
      enabled: process.env.PAYLOAD_MEDIA_STORAGE !== "local",
      // The plugin adds columns to the media table (_objectKey, prefix) — but
      // only while enabled, unless this is on. Without it, a migration made
      // with storage off (offline tests) lacked them, and the first upload in
      // production failed. Keeps the schema identical either way.
      alwaysInsertFields: true,
      collections: {
        media: { adapter: supabaseStorage, disableLocalStorage: true, disablePayloadAccessControl: true },
      },
    }),
  ],

  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
});

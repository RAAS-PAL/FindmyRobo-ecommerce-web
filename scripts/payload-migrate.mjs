/**
 * Runs Payload's database migrations once, before `next build` (see
 * payload.config.ts for why not on server start). On Vercel this is what
 * creates the CMS tables and, on the first deploy, seeds them with the site's
 * current content (payload/seed.ts).
 *
 * No DATABASE_URL → the CMS is not set up yet: skip with a warning, and the
 * site builds with its built-in content, as before. DATABASE_URL without
 * PAYLOAD_SECRET is a misconfiguration and stops the build, rather than
 * deploying a CMS nobody can sign in to.
 */
import { spawnSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.warn("[cms] DATABASE_URL is not set — skipping CMS migrations; the site will use its built-in content.");
  process.exit(0);
}
if (!process.env.PAYLOAD_SECRET) {
  console.error("[cms] DATABASE_URL is set but PAYLOAD_SECRET is not. Add PAYLOAD_SECRET (a long random string) and redeploy.");
  process.exit(1);
}

const result = spawnSync("pnpm", ["exec", "payload", "migrate"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
process.exit(result.status ?? 1);

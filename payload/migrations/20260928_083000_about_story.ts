import type { MigrateUpArgs } from "@payloadcms/db-postgres";
import { about } from "@/data/about";

/**
 * Publishes the company's own story (data/about.ts) over the placeholder the
 * CMS was seeded with. Content, not schema.
 *
 * Only the placeholder is replaced — a story already written in /cms stays.
 * The update starts from the published page rather than the latest save, so
 * an editor's unpublished draft of other fields is not published along with it.
 */
const PLACEHOLDER_START = "Thai lawns are hard on machines.";

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const published = await payload.findGlobal({ slug: "about", depth: 0, draft: false, req });
  const current = published.storyBody?.en?.trim() ?? "";
  if (current && !current.startsWith(PLACEHOLDER_START)) {
    payload.logger.info("about story: not the placeholder any more — left as is");
    return;
  }

  const latest = await payload.findGlobal({ slug: "about", depth: 0, draft: true, req });
  if (latest._status === "draft") {
    payload.logger.warn("about story: an unpublished About draft still has the old story — find it under Versions in /cms");
  }

  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, globalType: _globalType, ...fields } =
    published as typeof published & { globalType?: string };
  await payload.updateGlobal({
    slug: "about",
    data: {
      ...fields,
      storyBody: { en: about.story.body.en.join("\n\n"), th: about.story.body.th.join("\n\n") },
      _status: "published",
    },
    draft: false,
    req,
  });
  payload.logger.info("about story: published the company's own story");
}

/** Nothing to undo: the previous story is in the About page's version history. */
export async function down(): Promise<void> {}

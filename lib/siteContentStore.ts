import { cache } from "react";
import { createServiceClient } from "@/lib/supabase/service";
import {
  CONTENT_SECTIONS,
  DEFAULT_CONTENT,
  type ContentSection,
  type SiteContent,
} from "@/data/siteContent";

/**
 * Supabase-backed store for the admin Content section — the only module that
 * knows about the site_content tables (supabase/add-site-content.sql).
 *
 * Service-role client, like lib/productStore.ts: storefront reads happen in
 * server components, and writes only in admin routes that check the role first.
 */

const TABLE = "site_content";
const REVISIONS = "site_content_revisions";

type DbError = { code?: string; message?: string } | null;

/**
 * The migration has not been run. Postgres says 42P01; PostgREST says PGRST205
 * ("not in the schema cache"). Either way the site falls back to the defaults
 * rather than failing, exactly as it did before the Content section existed.
 */
const isMissingTable = (error: DbError) =>
  error?.code === "42P01" || error?.code === "PGRST205";

let warnedMissing = false;
function warnMissingOnce() {
  if (warnedMissing) return;
  warnedMissing = true;
  console.warn(
    "site_content table missing — showing built-in content. Run supabase/add-site-content.sql."
  );
}

/**
 * A stored section laid over its defaults, key by key. A field added to a
 * section after it was last saved therefore shows its default instead of
 * `undefined`, and nothing has to be migrated when the shape grows.
 */
function mergeSection<S extends ContentSection>(
  section: S,
  stored: unknown
): SiteContent[S] {
  const defaults = DEFAULT_CONTENT[section];
  if (!stored || typeof stored !== "object" || Array.isArray(stored)) return defaults;
  return { ...defaults, ...(stored as Partial<SiteContent[S]>) };
}

/**
 * Everything the storefront renders from the Content section. Cached per
 * request, so the layout, the page and generateMetadata share one query.
 *
 * Throws on a real database error rather than quietly serving defaults: when a
 * page regenerates after a save, a thrown error keeps the previous good page,
 * whereas defaults would silently roll the live site back to old copy.
 */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from(TABLE).select("section, content");
  if (error) {
    if (isMissingTable(error)) {
      warnMissingOnce();
      return DEFAULT_CONTENT;
    }
    throw new Error(`Failed to load site content: ${error.message}`);
  }

  const rows = new Map((data ?? []).map((row) => [row.section as string, row.content]));
  return Object.fromEntries(
    CONTENT_SECTIONS.map((section) => [section, mergeSection(section, rows.get(section))])
  ) as unknown as SiteContent;
});

export interface ContentRevision {
  id: number;
  createdAt: string;
  createdByEmail: string | null;
}

export interface SectionState<S extends ContentSection> {
  content: SiteContent[S];
  /** null while the section has never been saved (defaults showing). */
  updatedAt: string | null;
  revisions: ContentRevision[];
  /** false until supabase/add-site-content.sql has been run. */
  ready: boolean;
}

/** One section plus its save history, for the admin editor. */
export async function getSectionState<S extends ContentSection>(
  section: S,
  historyLimit = 20
): Promise<SectionState<S>> {
  const supabase = createServiceClient();
  const [current, history] = await Promise.all([
    supabase.from(TABLE).select("content, updated_at").eq("section", section).maybeSingle(),
    supabase
      .from(REVISIONS)
      .select("id, created_at, created_by_email")
      .eq("section", section)
      .order("created_at", { ascending: false })
      .limit(historyLimit),
  ]);

  if (isMissingTable(current.error) || isMissingTable(history.error)) {
    return { content: DEFAULT_CONTENT[section], updatedAt: null, revisions: [], ready: false };
  }
  if (current.error) throw new Error(`Failed to load ${section}: ${current.error.message}`);
  if (history.error) throw new Error(`Failed to load ${section} history: ${history.error.message}`);

  return {
    content: mergeSection(section, current.data?.content),
    updatedAt: current.data?.updated_at ?? null,
    revisions: (history.data ?? []).map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      createdByEmail: row.created_by_email,
    })),
    ready: true,
  };
}

export class ContentTableMissingError extends Error {
  constructor() {
    super("The site_content table does not exist yet. Run supabase/add-site-content.sql.");
  }
}

/**
 * Publish a section and append it to the history. The caller has already
 * validated `content` (lib/siteContentValidation.ts) and checked the role.
 *
 * Two writes, not a transaction: if the history insert fails, the save still
 * stands and is reported — losing one history entry beats refusing a save
 * the editor believes went through.
 */
export async function saveSection(
  section: ContentSection,
  content: unknown,
  user: { id: string; email: string | null }
): Promise<{ updatedAt: string }> {
  const supabase = createServiceClient();
  const updatedAt = new Date().toISOString();

  const { error } = await supabase
    .from(TABLE)
    .upsert({ section, content, updated_at: updatedAt, updated_by: user.id });
  if (isMissingTable(error)) throw new ContentTableMissingError();
  if (error) throw new Error(`Failed to save ${section}: ${error.message}`);

  const { error: historyError } = await supabase.from(REVISIONS).insert({
    section,
    content,
    created_at: updatedAt,
    created_by: user.id,
    created_by_email: user.email,
  });
  if (historyError) {
    console.error(`Saved ${section} but could not record history:`, historyError.message);
  }

  return { updatedAt };
}

/** The stored content of one past save, or null if it is not in that section. */
export async function getRevisionContent(
  section: ContentSection,
  id: number
): Promise<unknown | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from(REVISIONS)
    .select("content")
    .eq("section", section)
    .eq("id", id)
    .maybeSingle();
  if (isMissingTable(error)) throw new ContentTableMissingError();
  if (error) throw new Error(`Failed to load revision ${id}: ${error.message}`);
  return data?.content ?? null;
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, ExternalLink, History, LoaderCircle, RotateCcw, Save } from "lucide-react";
import { useConfirm } from "@/components/admin/ConfirmProvider";
import type { ContentSection, SiteContent } from "@/data/siteContent";
import type { ContentRevision } from "@/lib/siteContentStore";

/** What the server page passes every section editor besides the content itself. */
export interface EditorMeta {
  updatedAt: string | null;
  revisions: ContentRevision[];
  /** false until supabase/add-site-content.sql has been run. */
  ready: boolean;
}

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

/**
 * State for one section editor: the working copy, whether it differs from
 * what is live, and save/restore against the content API.
 *
 * "Live" is tracked here rather than re-read from the server props, because
 * the server normalises what it stores (blank rows dropped, text trimmed) and
 * returns that — adopting it keeps the form showing exactly what went live.
 */
export function useContentEditor<S extends ContentSection>(section: S, initial: SiteContent[S]) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [live, setLive] = useState(initial);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const dirty = useMemo(() => JSON.stringify(value) !== JSON.stringify(live), [value, live]);

  // Leaving the page (closing the tab, reloading) with unsaved edits asks first.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const adopt = (content: SiteContent[S]) => {
    setValue(content);
    setLive(content);
    setStatus({ kind: "saved" });
    router.refresh(); // pick up the new "last saved" time and history entry
  };

  const request = async (url: string, init: RequestInit) => {
    setStatus({ kind: "saving" });
    try {
      const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({ kind: "error", message: json.error ?? `HTTP ${res.status}` });
        return;
      }
      adopt(json.content as SiteContent[S]);
    } catch {
      setStatus({ kind: "error", message: "network" });
    }
  };

  return {
    section,
    value,
    setValue: (next: SiteContent[S]) => {
      setValue(next);
      if (status.kind !== "saving") setStatus({ kind: "idle" });
    },
    /** Update one field of the section. */
    set: <K extends keyof SiteContent[S]>(key: K, next: SiteContent[S][K]) => {
      setValue((prev) => ({ ...prev, [key]: next }));
      if (status.kind !== "saving") setStatus({ kind: "idle" });
    },
    dirty,
    status,
    save: () => request(`/api/admin/content/${section}`, { method: "PUT", body: JSON.stringify(value) }),
    restore: (revisionId: number) =>
      request(`/api/admin/content/${section}/restore`, {
        method: "POST",
        body: JSON.stringify({ revisionId }),
      }),
  };
}

export type ContentEditor<S extends ContentSection> = ReturnType<typeof useContentEditor<S>>;

/**
 * Frame around every section editor: the form, a sticky save bar, and the
 * version history. Saving publishes straight to the live site (the agreed
 * workflow: no drafts), which is why history + restore sit right beside it.
 */
export default function EditorShell<S extends ContentSection>({
  editor,
  meta,
  viewHref,
  children,
}: {
  editor: ContentEditor<S>;
  meta: EditorMeta;
  /** Storefront page to check the result on; null for sections with no single page. */
  viewHref: string | null;
  children: React.ReactNode;
}) {
  const t = useTranslations("admin.content.editor");
  const locale = useLocale();
  const confirm = useConfirm();
  const { dirty, status } = editor;
  const saving = status.kind === "saving";
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString(locale === "th" ? "th-TH" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  // Storefront URLs: Thai has no prefix, English lives under /en.
  const storefrontHref = viewHref && (locale === "th" ? viewHref : `/en${viewHref === "/" ? "" : viewHref}`);

  const handleRestore = async (revision: ContentRevision, index: number) => {
    const ok = await confirm({
      title: t("restoreTitle"),
      message: dirty
        ? t("restoreMessageDirty", { time: formatTime(revision.createdAt) })
        : t("restoreMessage", { time: formatTime(revision.createdAt) }),
      confirmLabel: t("restore"),
    });
    if (ok && index !== 0) await editor.restore(revision.id);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-start">
      <form
        // Native validation is off on purpose: required fields can sit inside a
        // collapsed panel, and the browser refuses to submit a form whose
        // invalid field it cannot scroll to — silently. The server validates
        // everything and names the field instead.
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (dirty && !saving && meta.ready) editor.save();
        }}
        className="min-w-0 space-y-5"
      >
        {children}

        {/* sticky save bar */}
        <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-forest-100 bg-surface/95 p-4 shadow-[0_16px_40px_-16px_rgba(10,46,31,0.35)] backdrop-blur sm:px-6">
          <p className="min-w-0 text-[13px]" role="status" aria-live="polite">
            {status.kind === "error" ? (
              <span className="font-semibold text-red-600">
                {status.message === "network" ? t("networkError") : t("saveError", { reason: status.message })}
              </span>
            ) : status.kind === "saved" && !dirty ? (
              <span className="flex items-center gap-1.5 font-semibold text-forest-700 dark:text-gold">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                {t("savedLive")}
              </span>
            ) : dirty ? (
              <span className="font-semibold text-amber-600">{t("unsaved")}</span>
            ) : (
              <span className="text-ink-muted">
                {meta.updatedAt ? t("lastSaved", { time: formatTime(meta.updatedAt) }) : t("neverSaved")}
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            {storefrontHref && (
              <a
                href={storefrontHref}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-[44px] items-center gap-2 rounded-full border border-forest-100 px-5 text-[13px] font-semibold text-content transition-colors hover:border-gold"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                {t("viewOnSite")}
              </a>
            )}
            <button
              type="submit"
              disabled={!dirty || saving || !meta.ready}
              className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full bg-gold px-7 text-[13.5px] font-bold text-forest-950 transition-all duration-300 hover:shadow-[0_0_28px_-4px_rgba(245,200,66,0.65)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="h-4 w-4" aria-hidden="true" />
              )}
              {t("publish")}
            </button>
          </div>
        </div>
      </form>

      {/* version history */}
      <aside className="rounded-2xl border border-forest-100 bg-surface p-5 lg:sticky lg:top-24">
        <h2 className="flex items-center gap-2 font-display text-base font-bold text-content">
          <History className="h-4 w-4 text-gold-600" aria-hidden="true" />
          {t("historyTitle")}
        </h2>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">{t("historyNote")}</p>
        {meta.revisions.length === 0 ? (
          <p className="mt-4 text-[12.5px] text-ink-muted">{t("historyEmpty")}</p>
        ) : (
          <ol className="mt-4 space-y-2">
            {meta.revisions.map((revision, index) => (
              <li
                key={revision.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-forest-100 px-3 py-2.5"
              >
                <span className="min-w-0">
                  <span className="block text-[12.5px] font-semibold text-content">
                    {formatTime(revision.createdAt)}
                  </span>
                  <span className="block truncate text-[11.5px] text-ink-muted">
                    {index === 0 ? t("current") : revision.createdByEmail ?? "—"}
                  </span>
                </span>
                {index !== 0 && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleRestore(revision, index)}
                    title={t("restore")}
                    aria-label={`${t("restore")} — ${formatTime(revision.createdAt)}`}
                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-gold/15 hover:text-gold-600 disabled:opacity-40"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </li>
            ))}
          </ol>
        )}
      </aside>
    </div>
  );
}

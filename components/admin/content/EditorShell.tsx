"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, Eye, History, LoaderCircle, RotateCcw, Save, X } from "lucide-react";
import { useConfirm } from "@/components/admin/ConfirmProvider";
import type { ContentSection, SiteContent } from "@/data/siteContent";
import type { PreviewTarget } from "@/lib/cmsPreview";
import type { ContentRevision } from "@/lib/siteContentStore";
import LivePreview from "./LivePreview";
import { PreviewTargetContext } from "./PreviewTarget";

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
 * Frame around every section editor: the form with a sticky save bar on the
 * left; on the right, a live preview of the draft and the version history.
 * Saving publishes straight to the live site (the agreed workflow: no
 * drafts), which is why the preview and restore sit right beside the form.
 *
 * Below the xl breakpoint there is no room for two columns, so the right pane
 * becomes a full-screen overlay opened from the save bar.
 */
export default function EditorShell<S extends ContentSection>({
  editor,
  meta,
  previewPath,
  customPreview,
  children,
}: {
  editor: ContentEditor<S>;
  meta: EditorMeta;
  /** Storefront page the preview frames (locale-less), e.g. "/" or "/about". */
  previewPath?: string;
  /** A preview other than the framed page — the SEO editor's search/share cards. */
  customPreview?: React.ReactNode;
  children: React.ReactNode;
}) {
  const t = useTranslations("admin.content.editor");
  const tp = useTranslations("admin.content.preview");
  const locale = useLocale();
  const confirm = useConfirm();
  const { dirty, status } = editor;
  const saving = status.kind === "saving";
  const [tab, setTab] = useState<"preview" | "history">("preview");
  const [overlay, setOverlay] = useState(false);
  const [scrollRequest, setScrollRequest] = useState<{ target: PreviewTarget; n: number } | null>(null);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString(locale === "th" ? "th-TH" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  // Panels report the storefront section they edit. Only a change of section
  // scrolls the preview — moving between fields of the same panel must not
  // yank the preview back if it has been scrolled by hand.
  const requestPreview = useCallback((target: PreviewTarget, force = false) => {
    setScrollRequest((prev) =>
      !force && prev?.target === target ? prev : { target, n: (prev?.n ?? 0) + 1 }
    );
  }, []);

  // Escape closes the overlay preview, and so does widening the window to the
  // two-column layout, where the pane is back beside the form.
  useEffect(() => {
    if (!overlay) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOverlay(false);
    const wide = window.matchMedia("(min-width: 1280px)");
    const onWide = () => wide.matches && setOverlay(false);
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [overlay]);

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

  const preview =
    customPreview ??
    (previewPath ? (
      <LivePreview
        section={editor.section}
        draft={editor.value}
        path={previewPath}
        scrollRequest={scrollRequest}
        dirty={dirty}
      />
    ) : null);

  const history = (
    <div className="min-h-0 flex-1 overflow-y-auto p-5">
      <p className="text-[12px] leading-relaxed text-ink-muted">{t("historyNote")}</p>
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
    </div>
  );

  return (
    <PreviewTargetContext.Provider value={requestPreview}>
      <div className="grid gap-6 xl:grid-cols-[minmax(540px,5fr)_minmax(0,6fr)] xl:items-start">
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
              {/* The side pane is not shown below xl; this opens it as an overlay. */}
              <button
                type="button"
                onClick={() => setOverlay(true)}
                className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border border-forest-100 px-5 text-[13px] font-semibold text-content transition-colors hover:border-gold xl:hidden"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                {tp("open")}
              </button>
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

        {overlay && (
          <div
            className="fixed inset-0 z-40 bg-forest-950/50 backdrop-blur-sm xl:hidden"
            onClick={() => setOverlay(false)}
            aria-hidden="true"
          />
        )}

        {/* preview + history. Sticky beside the form on xl; an overlay below it. */}
        <aside
          aria-label={tp("paneLabel")}
          className={`flex-col overflow-hidden rounded-2xl border border-forest-100 bg-surface ${
            overlay ? "fixed inset-3 z-50 flex" : "hidden"
          } xl:sticky xl:top-20 xl:flex xl:h-[calc(100vh-6rem)]`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-forest-100 px-3 pt-2">
            <div role="tablist" className="flex gap-1">
              {(["preview", "history"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => setTab(key)}
                  className={`flex cursor-pointer items-center gap-2 border-b-2 px-3 pb-2 pt-1 text-[13px] font-semibold transition-colors ${
                    tab === key
                      ? "border-gold text-content"
                      : "border-transparent text-ink-muted hover:text-content"
                  }`}
                >
                  {key === "preview" ? (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <History className="h-4 w-4" aria-hidden="true" />
                  )}
                  {key === "preview" ? tp("tab") : t("historyTitle")}
                  {key === "history" && meta.revisions.length > 0 && (
                    <span className="rounded-full bg-forest-100/70 px-1.5 font-mono text-[10.5px] text-ink-muted">
                      {meta.revisions.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            {overlay && (
              <button
                type="button"
                onClick={() => setOverlay(false)}
                aria-label={tp("close")}
                title={tp("close")}
                className="mb-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-ink-muted hover:text-content xl:hidden"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          {/* The preview stays mounted while History is open, so switching back
              does not reload the page in the frame. */}
          <div className={`min-h-0 flex-1 flex-col ${tab === "preview" ? "flex" : "hidden"}`}>{preview}</div>
          {tab === "history" && history}
        </aside>
      </div>
    </PreviewTargetContext.Provider>
  );
}

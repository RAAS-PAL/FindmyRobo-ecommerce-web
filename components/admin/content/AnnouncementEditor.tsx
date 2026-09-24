"use client";

import { useTranslations } from "next-intl";
import type { AnnouncementContent, Bilingual } from "@/data/siteContent";
import EditorShell, { useContentEditor, type EditorMeta } from "./EditorShell";
import { BilingualField, emptyBilingual, ListEditor, Panel, Toggle } from "./fields";

/** The gold scrolling bar above the navbar, on every page. */
export default function AnnouncementEditor({
  initial,
  meta,
}: {
  initial: AnnouncementContent;
  meta: EditorMeta;
}) {
  const t = useTranslations("admin.content.announcement");
  const editor = useContentEditor("announcement", initial);
  const { value, set } = editor;

  return (
    <EditorShell editor={editor} meta={meta} viewHref="/">
      <Panel title={t("title")} note={t("note")}>
        <Toggle
          label={t("enabled")}
          checked={value.enabled}
          onChange={(enabled) => set("enabled", enabled)}
          hint={t("enabledHint")}
        />
        <ListEditor<Bilingual>
          items={value.messages}
          onChange={(messages) => set("messages", messages)}
          create={emptyBilingual}
          isEmpty={(m) => !m.en && !m.th}
          max={6}
          itemLabel={(i) => t("item", { number: i + 1 })}
          addLabel={t("add")}
        >
          {(message, update) => (
            <BilingualField
              label={t("message")}
              value={message}
              onChange={update}
              required
              maxLength={140}
              recommended={60}
            />
          )}
        </ListEditor>
      </Panel>
    </EditorShell>
  );
}

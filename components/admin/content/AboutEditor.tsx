"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import type { AboutStat, AboutValue, Milestone, TeamMember } from "@/data/about";
import type { AboutContent } from "@/data/siteContent";
import EditorShell, { useContentEditor, type EditorMeta } from "./EditorShell";
import {
  BilingualField,
  emptyBilingual,
  hintClass,
  ImageField,
  inputClass,
  labelClass,
  ListEditor,
  Panel,
  TextField,
  textareaClass,
  Toggle,
} from "./fields";

/**
 * Paragraphs are edited as one text box per language, split on a blank line.
 * Splitting on the literal "\n\n" (not a regex that eats extra newlines) makes
 * the round trip lossless, so the cursor never jumps while typing; the server
 * trims and drops empty paragraphs when it saves.
 */
const PARAGRAPH_BREAK = "\n\n";

function ParagraphsField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: AboutContent["storyBody"];
  onChange: (value: AboutContent["storyBody"]) => void;
}) {
  const t = useTranslations("admin.content.fields");
  const id = useId();
  return (
    <fieldset>
      <legend className={labelClass}>{label}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {(["en", "th"] as const).map((lang) => (
          <div key={lang}>
            <label
              htmlFor={`${id}-${lang}`}
              className="mb-1 block font-mono text-[10.5px] font-semibold uppercase tracking-wider text-ink-muted"
            >
              {lang === "en" ? t("english") : t("thai")}
            </label>
            <textarea
              id={`${id}-${lang}`}
              lang={lang}
              rows={10}
              value={value[lang].join(PARAGRAPH_BREAK)}
              onChange={(e) => onChange({ ...value, [lang]: e.target.value.split(PARAGRAPH_BREAK) })}
              className={textareaClass}
            />
          </div>
        ))}
      </div>
      <p className={hintClass}>{hint}</p>
    </fieldset>
  );
}

const ICONS: AboutValue["icon"][] = ["shield", "home", "wrench", "headset"];

/** The /about page: everything company-specific on it. */
export default function AboutEditor({ initial, meta }: { initial: AboutContent; meta: EditorMeta }) {
  const t = useTranslations("admin.content.about");
  const editor = useContentEditor("about", initial);
  const { value, set } = editor;
  const iconId = useId();

  return (
    <EditorShell editor={editor} meta={meta} viewHref="/about">
      <Panel title={t("intro.title")}>
        <BilingualField
          label={t("intro.label")}
          value={value.intro}
          onChange={(v) => set("intro", v)}
          multiline
          required
          maxLength={500}
        />
      </Panel>

      <Panel title={t("stats.title")} note={t("stats.note")} defaultOpen={false}>
        <ListEditor<AboutStat>
          items={value.stats}
          onChange={(v) => set("stats", v)}
          create={() => ({ value: "", label: emptyBilingual() })}
          isEmpty={(s) => !s.value && !s.label.en && !s.label.th}
          max={6}
          itemLabel={(i) => t("stats.item", { number: i + 1 })}
          addLabel={t("stats.add")}
        >
          {(stat, update) => (
            <>
              <TextField
                label={t("stats.value")}
                value={stat.value}
                onChange={(v) => update({ ...stat, value: v })}
                required
                maxLength={12}
                hint={t("stats.valueHint")}
              />
              <BilingualField
                label={t("stats.label")}
                value={stat.label}
                onChange={(label) => update({ ...stat, label })}
                required
                maxLength={40}
              />
            </>
          )}
        </ListEditor>
      </Panel>

      <Panel title={t("story.title")} defaultOpen={false}>
        <ParagraphsField
          label={t("story.body")}
          hint={t("story.bodyHint")}
          value={value.storyBody}
          onChange={(v) => set("storyBody", v)}
        />
        <ImageField
          label={t("story.image")}
          value={value.storyImage}
          onChange={(v) => set("storyImage", v)}
          required
          hint={t("story.imageHint")}
        />
      </Panel>

      <Panel title={t("partner.title")} note={t("partner.note")} defaultOpen={false}>
        <Toggle
          label={t("partner.enabled")}
          checked={value.partnerEnabled}
          onChange={(v) => set("partnerEnabled", v)}
        />
        <BilingualField
          label={t("partner.eyebrow")}
          value={value.partnerEyebrow}
          onChange={(v) => set("partnerEyebrow", v)}
          required={value.partnerEnabled}
          maxLength={40}
          hint={t("partner.eyebrowHint")}
        />
        <TextField
          label={t("partner.name")}
          value={value.partnerName}
          onChange={(v) => set("partnerName", v)}
          required={value.partnerEnabled}
          maxLength={60}
        />
        <BilingualField
          label={t("partner.status")}
          value={value.partnerStatus}
          onChange={(v) => set("partnerStatus", v)}
          required={value.partnerEnabled}
          maxLength={80}
          hint={t("partner.statusHint")}
        />
        <BilingualField
          label={t("partner.body")}
          value={value.partnerBody}
          onChange={(v) => set("partnerBody", v)}
          multiline
          required={value.partnerEnabled}
          maxLength={500}
        />
        <ImageField
          label={t("partner.logo")}
          value={value.partnerLogo}
          onChange={(v) => set("partnerLogo", v)}
          hint={t("partner.logoHint")}
        />
      </Panel>

      <Panel title={t("values.title")} note={t("values.note")} defaultOpen={false}>
        <ListEditor<AboutValue>
          items={value.values}
          onChange={(v) => set("values", v)}
          create={() => ({ icon: "shield", title: emptyBilingual(), body: emptyBilingual() })}
          isEmpty={(v) => !v.title.en && !v.title.th && !v.body.en && !v.body.th}
          max={8}
          itemLabel={(i) => t("values.item", { number: i + 1 })}
          addLabel={t("values.add")}
        >
          {(item, update, index) => (
            <>
              <div>
                <label htmlFor={`${iconId}-${index}`} className={labelClass}>
                  {t("values.icon")}
                </label>
                <select
                  id={`${iconId}-${index}`}
                  value={item.icon}
                  onChange={(e) => update({ ...item, icon: e.target.value as AboutValue["icon"] })}
                  className={`${inputClass} cursor-pointer sm:max-w-xs`}
                >
                  {ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {t(`values.icons.${icon}`)}
                    </option>
                  ))}
                </select>
              </div>
              <BilingualField
                label={t("values.itemTitle")}
                value={item.title}
                onChange={(title) => update({ ...item, title })}
                required
                maxLength={60}
              />
              <BilingualField
                label={t("values.body")}
                value={item.body}
                onChange={(body) => update({ ...item, body })}
                multiline
                rows={2}
                required
                maxLength={300}
              />
            </>
          )}
        </ListEditor>
      </Panel>

      <Panel title={t("milestones.title")} defaultOpen={false}>
        <ListEditor<Milestone>
          items={value.milestones}
          onChange={(v) => set("milestones", v)}
          create={() => ({ when: "", title: emptyBilingual(), body: emptyBilingual() })}
          isEmpty={(m) => !m.when && !m.title.en && !m.title.th && !m.body.en && !m.body.th}
          max={20}
          itemLabel={(i) => t("milestones.item", { number: i + 1 })}
          addLabel={t("milestones.add")}
        >
          {(milestone, update) => (
            <>
              <TextField
                label={t("milestones.when")}
                value={milestone.when}
                onChange={(when) => update({ ...milestone, when })}
                required
                maxLength={20}
                hint={t("milestones.whenHint")}
              />
              <BilingualField
                label={t("milestones.itemTitle")}
                value={milestone.title}
                onChange={(title) => update({ ...milestone, title })}
                required
                maxLength={80}
              />
              <BilingualField
                label={t("milestones.body")}
                value={milestone.body}
                onChange={(body) => update({ ...milestone, body })}
                multiline
                rows={2}
                required
                maxLength={300}
              />
            </>
          )}
        </ListEditor>
      </Panel>

      <Panel title={t("team.title")} note={t("team.note")} defaultOpen={false}>
        <ListEditor<TeamMember>
          items={value.team}
          onChange={(v) => set("team", v)}
          create={() => ({ name: "", role: emptyBilingual(), photo: null })}
          isEmpty={(m) => !m.name && !m.role.en && !m.role.th && !m.photo}
          max={24}
          itemLabel={(i) => t("team.item", { number: i + 1 })}
          addLabel={t("team.add")}
        >
          {(member, update) => (
            <>
              <TextField
                label={t("team.name")}
                value={member.name}
                onChange={(name) => update({ ...member, name })}
                required
                maxLength={80}
              />
              <BilingualField
                label={t("team.role")}
                value={member.role}
                onChange={(role) => update({ ...member, role })}
                required
                maxLength={60}
              />
              <ImageField
                label={t("team.photo")}
                value={member.photo ?? ""}
                onChange={(photo) => update({ ...member, photo: photo || null })}
                hint={t("team.photoHint")}
              />
            </>
          )}
        </ListEditor>
      </Panel>
    </EditorShell>
  );
}

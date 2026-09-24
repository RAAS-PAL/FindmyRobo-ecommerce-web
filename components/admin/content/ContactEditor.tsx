"use client";

import { useTranslations } from "next-intl";
import { SOCIAL_PLATFORMS, type ContactContent } from "@/data/siteContent";
import EditorShell, { useContentEditor, type EditorMeta } from "./EditorShell";
import { BilingualField, ImageField, Panel, TextField } from "./fields";

const SOCIAL_LABELS: Record<(typeof SOCIAL_PLATFORMS)[number], string> = {
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
};

/** Phone, email, LINE and social links — footer, /contact-sales, emails, Google. */
export default function ContactEditor({
  initial,
  meta,
}: {
  initial: ContactContent;
  meta: EditorMeta;
}) {
  const t = useTranslations("admin.content.contact");
  const editor = useContentEditor("contact", initial);
  const { value, set } = editor;

  return (
    <EditorShell editor={editor} meta={meta} previewPath="/contact-sales">
      <Panel title={t("main.title")} note={t("main.note")} previewTarget="contact-main">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label={t("main.phone")}
            type="tel"
            value={value.phone}
            onChange={(v) => set("phone", v)}
            required
            maxLength={24}
            mono
          />
          <TextField
            label={t("main.email")}
            type="email"
            value={value.email}
            onChange={(v) => set("email", v)}
            required
            maxLength={120}
            hint={t("main.emailHint")}
            mono
          />
        </div>
        <BilingualField
          label={t("main.hours")}
          value={value.phoneHours}
          onChange={(v) => set("phoneHours", v)}
          maxLength={60}
          hint={t("main.hoursHint")}
        />
      </Panel>

      <Panel title={t("line.title")} note={t("line.note")} previewTarget="contact-line">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label={t("line.id")}
            value={value.lineId}
            onChange={(v) => set("lineId", v)}
            required
            maxLength={40}
            mono
          />
          <TextField
            label={t("line.url")}
            type="url"
            value={value.lineUrl}
            onChange={(v) => set("lineUrl", v)}
            maxLength={2048}
            placeholder="https://lin.ee/…"
            mono
          />
        </div>
        <ImageField
          label={t("line.qr")}
          value={value.lineQrImage}
          onChange={(v) => set("lineQrImage", v)}
          hint={t("line.qrHint")}
        />
      </Panel>

      <Panel title={t("social.title")} note={t("social.note")} previewTarget="footer">
        {SOCIAL_PLATFORMS.map((platform) => (
          <TextField
            key={platform}
            label={SOCIAL_LABELS[platform]}
            type="url"
            value={value.socials[platform]}
            onChange={(v) => set("socials", { ...value.socials, [platform]: v })}
            maxLength={2048}
            placeholder="https://…"
            mono
          />
        ))}
      </Panel>
    </EditorShell>
  );
}

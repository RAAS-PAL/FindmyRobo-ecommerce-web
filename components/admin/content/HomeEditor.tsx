"use client";

import { useTranslations } from "next-intl";
import type { GalleryVideo, HomeContent, HomeStat, ShowcaseFeature } from "@/data/siteContent";
import EditorShell, { useContentEditor, type EditorMeta } from "./EditorShell";
import {
  BilingualField,
  emptyBilingual,
  ImageField,
  ListEditor,
  NumberField,
  Panel,
  TextField,
} from "./fields";

/** Homepage: hero, feature showcase, video gallery, and the "Who We Are" block. */
export default function HomeEditor({ initial, meta }: { initial: HomeContent; meta: EditorMeta }) {
  const t = useTranslations("admin.content.home");
  const editor = useContentEditor("home", initial);
  const { value, set } = editor;

  return (
    <EditorShell editor={editor} meta={meta} previewPath="/">
      <Panel title={t("hero.title")} note={t("hero.note")} previewTarget="hero">
        <BilingualField
          label={t("hero.headline")}
          value={value.heroHeadline}
          onChange={(v) => set("heroHeadline", v)}
          required
          maxLength={80}
          recommended={30}
          hint={t("hero.headlineHint")}
        />
        <BilingualField
          label={t("hero.accent")}
          value={value.heroAccent}
          onChange={(v) => set("heroAccent", v)}
          maxLength={80}
          recommended={30}
          hint={t("hero.accentHint")}
        />
        <BilingualField
          label={t("hero.sub")}
          value={value.heroSub}
          onChange={(v) => set("heroSub", v)}
          multiline
          required
          maxLength={300}
        />
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-content">{t("hero.videos")}</p>
          <p className="mb-3 text-[11.5px] leading-relaxed text-ink-muted">{t("hero.videosHint")}</p>
          <ListEditor<string>
            items={value.heroVideos}
            onChange={(v) => set("heroVideos", v)}
            create={() => ""}
            isEmpty={(url) => !url.trim()}
            max={6}
            itemLabel={(i) => t("hero.videoItem", { number: i + 1 })}
            addLabel={t("hero.addVideo")}
          >
            {(url, update) => (
              <TextField
                label={t("hero.videoUrl")}
                type="url"
                value={url}
                onChange={update}
                required
                maxLength={2048}
                placeholder="https://res.cloudinary.com/…/video/upload/q_auto/ac_none/…"
                mono
              />
            )}
          </ListEditor>
        </div>
      </Panel>

      <Panel title={t("showcase.title")} note={t("showcase.note")} defaultOpen={false} previewTarget="showcase">
        <ListEditor<ShowcaseFeature>
          items={value.featureShowcase}
          onChange={(v) => set("featureShowcase", v)}
          create={() => ({ image: "", heading: emptyBilingual(), body: emptyBilingual() })}
          isEmpty={(f) => !f.image && !f.heading.en && !f.heading.th && !f.body.en && !f.body.th}
          max={8}
          itemLabel={(i) => t("showcase.item", { number: i + 1 })}
          addLabel={t("showcase.add")}
        >
          {(feature, update) => (
            <>
              <ImageField
                label={t("showcase.image")}
                value={feature.image}
                onChange={(image) => update({ ...feature, image })}
                required
                hint={t("showcase.imageHint")}
              />
              <BilingualField
                label={t("showcase.heading")}
                value={feature.heading}
                onChange={(heading) => update({ ...feature, heading })}
                required
                maxLength={80}
              />
              <BilingualField
                label={t("showcase.body")}
                value={feature.body}
                onChange={(body) => update({ ...feature, body })}
                multiline
                required
                maxLength={400}
              />
            </>
          )}
        </ListEditor>
      </Panel>

      <Panel title={t("gallery.title")} note={t("gallery.note")} defaultOpen={false} previewTarget="gallery">
        <ListEditor<GalleryVideo>
          items={value.videoGallery}
          onChange={(v) => set("videoGallery", v)}
          create={() => ({ url: "", title: "", poster: "", tag: "", author: "" })}
          isEmpty={(v) => !v.url && !v.title && !v.poster && !v.tag && !v.author}
          max={12}
          itemLabel={(i) => t("gallery.item", { number: i + 1 })}
          addLabel={t("gallery.add")}
        >
          {(video, update) => (
            <>
              <TextField
                label={t("gallery.url")}
                type="url"
                value={video.url}
                onChange={(url) => update({ ...video, url })}
                required
                maxLength={2048}
                hint={t("gallery.urlHint")}
                mono
              />
              <ImageField
                label={t("gallery.poster")}
                value={video.poster ?? ""}
                onChange={(poster) => update({ ...video, poster })}
                hint={t("gallery.posterHint")}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  label={t("gallery.videoTitle")}
                  value={video.title}
                  onChange={(title) => update({ ...video, title })}
                  required
                  maxLength={100}
                />
                <TextField
                  label={t("gallery.tag")}
                  value={video.tag ?? ""}
                  onChange={(tag) => update({ ...video, tag })}
                  maxLength={40}
                  hint={t("gallery.tagHint")}
                />
              </div>
              <TextField
                label={t("gallery.author")}
                value={video.author ?? ""}
                onChange={(author) => update({ ...video, author })}
                maxLength={60}
                hint={t("gallery.authorHint")}
              />
            </>
          )}
        </ListEditor>
      </Panel>

      <Panel title={t("trust.title")} note={t("trust.note")} defaultOpen={false} previewTarget="trust">
        <BilingualField
          label={t("trust.heading")}
          value={value.trustHeading}
          onChange={(v) => set("trustHeading", v)}
          required
          maxLength={120}
        />
        <BilingualField
          label={t("trust.body")}
          value={value.trustBody}
          onChange={(v) => set("trustBody", v)}
          multiline
          rows={5}
          required
          maxLength={600}
        />
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-content">{t("trust.stats")}</p>
          <p className="mb-3 text-[11.5px] leading-relaxed text-ink-muted">{t("trust.statsHint")}</p>
          <ListEditor<HomeStat>
            items={value.trustStats}
            onChange={(v) => set("trustStats", v)}
            create={() => ({ value: 0, decimals: 0, suffix: "", label: emptyBilingual() })}
            isEmpty={(s) => !s.label.en && !s.label.th && !s.suffix && !s.value}
            max={3}
            itemLabel={(i) => t("trust.statItem", { number: i + 1 })}
            addLabel={t("trust.addStat")}
          >
            {(stat, update) => (
              <>
                <div className="grid gap-5 sm:grid-cols-3">
                  <NumberField
                    label={t("trust.value")}
                    value={stat.value}
                    onChange={(v) => update({ ...stat, value: v })}
                    min={0}
                    max={1_000_000_000}
                    step="any"
                  />
                  <NumberField
                    label={t("trust.decimals")}
                    value={stat.decimals}
                    onChange={(decimals) => update({ ...stat, decimals })}
                    min={0}
                    max={2}
                    hint={t("trust.decimalsHint")}
                  />
                  <TextField
                    label={t("trust.suffix")}
                    value={stat.suffix}
                    onChange={(suffix) => update({ ...stat, suffix })}
                    maxLength={4}
                    hint={t("trust.suffixHint")}
                  />
                </div>
                <BilingualField
                  label={t("trust.label")}
                  value={stat.label}
                  onChange={(label) => update({ ...stat, label })}
                  required
                  maxLength={40}
                />
              </>
            )}
          </ListEditor>
        </div>
      </Panel>
    </EditorShell>
  );
}

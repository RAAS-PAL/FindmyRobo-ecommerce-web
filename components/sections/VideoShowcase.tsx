"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Play } from "lucide-react";
import { useSiteContent } from "@/components/SiteContentProvider";
import type { GalleryVideo } from "@/data/siteContent";
import SectionHeader from "@/components/ui/SectionHeader";
import TextLink from "@/components/ui/TextLink";

/**
 * Home "See It in Action" video gallery. Each card is a lite embed: it shows a
 * poster + play button (no YouTube chrome) and only loads the player on click.
 * The videos are edited in Admin → Content → Homepage.
 * YouTube links play as a stripped-down privacy iframe (modestbranding, no
 * related videos); mp4 links play in a native player. Set a custom thumbnail on
 * each video for the cleanest, non-YouTube look —
 * otherwise it falls back to the video's YouTube thumbnail.
 */

function youTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i
  );
  return m ? m[1] : null;
}

function GalleryCard({ video }: { video: GalleryVideo }) {
  const [playing, setPlaying] = useState(false);
  const id = youTubeId(video.url);
  const poster = video.poster || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Snap back to the poster when the clip ends. YouTube only reports "ended"
  // through its iframe API, so we opt in (enablejsapi=1), announce we're
  // listening on load, then watch for playerState 0. (mp4 uses onEnded below.)
  useEffect(() => {
    if (!playing || !id) return;
    const onMessage = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow || typeof e.data !== "string") return;
      let data: { event?: string; info?: unknown };
      try {
        data = JSON.parse(e.data);
      } catch {
        return;
      }
      const info = data.info;
      const state =
        typeof info === "number"
          ? info
          : info && typeof info === "object"
            ? (info as { playerState?: number }).playerState
            : undefined;
      if ((data.event === "onStateChange" || data.event === "infoDelivery") && state === 0) {
        setPlaying(false);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [playing, id]);

  if (playing) {
    return (
      <article className="relative aspect-[16/10] w-full overflow-hidden rounded-card bg-forest-950">
        {id ? (
          <iframe
            ref={iframeRef}
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&modestbranding=1&rel=0&playsinline=1&enablejsapi=1&color=white`}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            onLoad={() =>
              iframeRef.current?.contentWindow?.postMessage(
                JSON.stringify({ event: "listening", id: 1, channel: "widget" }),
                "*"
              )
            }
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <video
            src={video.url}
            poster={poster || undefined}
            controls
            autoPlay
            muted
            playsInline
            onEnded={() => setPlaying(false)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </article>
    );
  }

  return (
    <article className="group relative aspect-[16/10] w-full overflow-hidden rounded-card bg-forest-950">
      <button
        type="button"
        onClick={() => setPlaying(true)}
        aria-label={video.title}
        className="absolute inset-0 h-full w-full cursor-pointer text-left"
      >
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element -- YouTube or CMS poster, any host
          <img
            src={poster}
            alt={video.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span className="absolute inset-0 bg-forest-900" aria-hidden="true" />
        )}

        {/* scrim under the caption */}
        <span className="photo-scrim-bottom pointer-events-none absolute inset-0" aria-hidden="true" />

        {/* center play button */}
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-forest-950 transition-[scale] duration-150 group-active:scale-[0.97]">
            <Play className="h-5 w-5 translate-x-0.5 fill-current" aria-hidden="true" />
          </span>
        </span>

        {/* title + author (left), product tag (right) */}
        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
          <span className="min-w-0">
            <span className="block truncate text-body font-semibold text-white">
              {video.title}
            </span>
            {video.author && (
              <span className="mt-0.5 block truncate text-caption text-white/75">
                {video.author}
              </span>
            )}
          </span>
          {video.tag && (
            <span className="shrink-0 text-caption text-white/80">{video.tag}</span>
          )}
        </span>
      </button>
    </article>
  );
}

export default function VideoShowcase() {
  const t = useTranslations("videoShowcase");
  const { home, contact } = useSiteContent();
  const videos = home.videoGallery;
  // the YouTube channel is this section's link, not a section of its own
  const channelUrl = contact.socials.youtube;
  // no videos in the CMS: no section, rather than an empty placeholder
  if (videos.length === 0) return null;

  return (
    <section className="bg-surface py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={t("heading")}
          action={channelUrl ? <TextLink href={channelUrl}>{t("channel")}</TextLink> : undefined}
        />

        {videos.length === 1 ? (
          // a lone video reads better as one wide card than a half-empty row
          <div className="mt-10 max-w-3xl">
            <GalleryCard video={videos[0]} />
          </div>
        ) : (
          // the first two are the big cards, the rest fill the next rows
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
            {videos.map((video, i) => (
              <div key={`${video.url}-${i}`} className={i < 2 ? "lg:col-span-3" : "lg:col-span-2"}>
                <GalleryCard video={video} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

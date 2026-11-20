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

export function GalleryCard({ video, autoPlay = false }: { video: GalleryVideo; autoPlay?: boolean }) {
  // autoPlay: chosen from the list beside the player, so it starts at once
  const [playing, setPlaying] = useState(autoPlay);
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

/**
 * The videos as one large player with the list of clips beside it (below it
 * on phones), not a grid of same-sized tiles. Choosing a clip from the list
 * puts it in the player and starts it.
 */
export default function VideoShowcase() {
  const t = useTranslations("videoShowcase");
  const { home, contact } = useSiteContent();
  const videos = home.videoGallery;
  // [clip on show, whether it was picked from the list]
  const [[current, picked], setCurrent] = useState<[number, boolean]>([0, false]);
  // no videos in the CMS: no section, rather than an empty placeholder
  if (videos.length === 0) return null;
  // the YouTube channel is this section's link, not a section of its own
  const channelUrl = contact.socials.youtube;

  return (
    <section className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={t("heading")}
          action={channelUrl ? <TextLink href={channelUrl}>{t("channel")}</TextLink> : undefined}
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.9fr_1fr] lg:gap-12">
          <GalleryCard key={current} video={videos[current]} autoPlay={picked} />
          {videos.length > 1 && (
            <ul className="border-t border-forest-100 dark:border-forest-700">
              {videos.map((video, i) => (
                <li key={`${video.url}-${i}`} className="border-b border-forest-100 dark:border-forest-700">
                  <button
                    type="button"
                    onClick={() => setCurrent([i, true])}
                    aria-current={i === current}
                    className="group flex w-full cursor-pointer items-center gap-4 py-3 text-left"
                  >
                    {video.poster && (
                      // eslint-disable-next-line @next/next/no-img-element -- CMS poster, any host
                      <img
                        src={video.poster}
                        alt=""
                        loading="lazy"
                        className="h-14 w-24 shrink-0 rounded-control object-cover"
                      />
                    )}
                    <span className="min-w-0">
                      <span
                        className={`block truncate text-body font-semibold underline-offset-4 group-hover:underline ${
                          i === current ? "text-accent-600" : "text-content"
                        }`}
                      >
                        {video.title}
                      </span>
                      {video.tag && <span className="block truncate text-small text-ink-muted">{video.tag}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

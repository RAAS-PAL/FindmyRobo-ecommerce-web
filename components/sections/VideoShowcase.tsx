"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Play, Tag } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import { siteConfig, type GalleryVideo } from "@/data/siteConfig";

/**
 * Home "See It in Action" video gallery. Each card is a lite embed: it shows a
 * poster + play button (no YouTube chrome) and only loads the player on click.
 * YouTube links play as a stripped-down privacy iframe (modestbranding, no
 * related videos); mp4 links play in a native player. Set a custom `poster` on
 * each card in siteConfig.videoGallery for the cleanest, non-YouTube look —
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
      <article className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-forest-950">
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
    <article className="group relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-forest-950">
      <button
        type="button"
        onClick={() => setPlaying(true)}
        aria-label={video.title}
        className="absolute inset-0 h-full w-full cursor-pointer text-left"
      >
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt={video.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <span className="absolute inset-0 bg-gradient-to-br from-forest via-forest-800 to-forest-950" aria-hidden="true" />
        )}

        {/* scrim for text + play legibility */}
        <span
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/15"
          aria-hidden="true"
        />

        {/* center play button */}
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
            <Play className="h-7 w-7 translate-x-0.5 fill-white text-white" aria-hidden="true" />
          </span>
        </span>

        {/* title + author (left), product tag (right) */}
        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
          <span className="min-w-0">
            <span className="block truncate text-lg font-bold text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]">
              {video.title}
            </span>
            {video.author && (
              <span className="mt-0.5 block truncate text-[12px] text-white/75">
                {video.author}
              </span>
            )}
          </span>
          {video.tag && (
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-sm">
              <Tag className="h-3 w-3 text-gold" aria-hidden="true" />
              {video.tag}
            </span>
          )}
        </span>
      </button>
    </article>
  );
}

export default function VideoShowcase() {
  const t = useTranslations("videoShowcase");
  const videos = siteConfig.videoGallery;

  return (
    <section className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-600">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-content sm:text-5xl">
            {t("heading")}
          </h2>
        </FadeIn>

        {videos.length === 0 ? (
          <FadeIn delay={0.1} className="mt-10">
            <div className="flex aspect-[16/6] items-center justify-center rounded-3xl border border-dashed border-forest-100 bg-cloud/60">
              <span className="flex flex-col items-center gap-3 text-ink-muted">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-950/5">
                  <Play className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold">{t("placeholder")}</span>
              </span>
            </div>
          </FadeIn>
        ) : videos.length === 1 ? (
          // a lone video reads better as one centred card than a half-empty row
          <FadeIn delay={0.1} className="mx-auto mt-10 max-w-3xl">
            <GalleryCard video={videos[0]} />
          </FadeIn>
        ) : (
          // bento: the first two are the big cards, the rest fill the next rows.
          // The col-span sits on the FadeIn because IT is the grid item.
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {videos.map((video, i) => (
              <FadeIn
                key={`${video.url}-${i}`}
                delay={i * 0.06}
                className={i < 2 ? "lg:col-span-3" : "lg:col-span-2"}
              >
                <GalleryCard video={video} />
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Renders an admin-supplied video URL: YouTube links become a privacy-mode
 * iframe embed, anything else (mp4 path/URL) becomes a native player.
 * Server-safe — no client hooks.
 */

function youTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i
  );
  return m ? m[1] : null;
}

export default function VideoEmbed({
  url,
  title,
  className = "",
}: {
  url: string;
  title: string;
  className?: string;
}) {
  const id = youTubeId(url);

  if (id) {
    return (
      <div className={`relative aspect-video overflow-hidden rounded-2xl bg-forest-950 ${className}`}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <video
      src={url}
      controls
      playsInline
      preload="metadata"
      className={`aspect-video w-full rounded-2xl bg-forest-950 object-cover ${className}`}
    />
  );
}

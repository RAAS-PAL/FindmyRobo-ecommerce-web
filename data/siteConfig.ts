/**
 * Site-wide settings.
 *
 * heroVideoUrls — hero background videos, played one after another in a
 * loop (1, 2, 3, back to 1). While the list is empty, the hero shows the
 * animated lawn scene instead.
 *
 * heroVideoPoster is NO LONGER USED. The player cross-fades between preloaded
 * clips and never shows a poster — a poster used to flash on every clip switch.
 * Don't re-wire it into the <video> without solving that first.
 *
 * ADDING A NEW HERO VIDEO — the encoding matters more than the source:
 * a raw export will stall on mobile no matter how fast the host is. Run it
 * through ffmpeg first (keep the source file somewhere outside the repo):
 *
 *   ffmpeg -ss 0 -i source.mp4 -t 12 -vf "scale=1920:-2" -r 30 \
 *     -c:v libx264 -profile:v main -pix_fmt yuv420p \
 *     -crf 27 -maxrate 2000k -bufsize 4000k \
 *     -movflags +faststart -an public/videos/hero-N.mp4
 *
 *   -movflags +faststart : index at the FRONT, so playback starts before the
 *                          file finishes downloading. Without it iOS Safari
 *                          refuses to autoplay and shows a play button.
 *   -pix_fmt yuv420p     : Safari will not decode 4:2:2/4:4:4 at all.
 *   -an                  : drop audio — the hero is muted anyway.
 *   ~12s, ~2 Mbps        : keep each file 2-3 MB. Bandwidth is billed.
 */
/** One card in the home video gallery (components/sections/VideoShowcase.tsx). */
export interface GalleryVideo {
  /** YouTube (Short) link, or an mp4 URL/path. */
  url: string;
  /** Custom thumbnail (URL or /public path). Falls back to the YouTube
   *  thumbnail; set this for a clean, non-YouTube look. */
  poster?: string;
  title: string;
  /** Small credit line, e.g. the creator's handle. */
  author?: string;
  /** Small pill label, e.g. the product shown. */
  tag?: string;
}

export const siteConfig = {
  heroVideoUrls: [
    // Plays in order, then loops back to the first. Both are stream-copied
    // from their sources (no re-encode, so original quality is preserved):
    //   hero-banner-luba3 = Banner_Luba 3.mp4 (full 50s, remuxed +faststart)
    //   hero-luba-mini     = brightest 20s (source 29-49s) of lubamini2.mp4
    "/videos/hero-banner-luba3.mp4",
    "/videos/hero-luba-mini.mp4",
  ] as string[],
  heroVideoPoster: "/videos/hero-poster.jpg" as string | null,

  /**
   * Home video gallery ("See It in Action"), shown between the product cards
   * and the "Who We Are" story (components/sections/VideoShowcase.tsx). Each
   * card shows its poster + a play button and only loads a stripped-down embed
   * on click (no YouTube chrome until played). Set a custom `poster` on every
   * card for the cleanest, non-YouTube look. Empty shows a placeholder.
   */
  videoGallery: [
    {
      url: "https://res.cloudinary.com/ddb7pxqfd/video/upload/v1785480888/YTDown.com_YouTube_LUBA-mini-2-AWD-1000-Enjoy-Every-Mowment_Media_1DecraXBr8Y_001_1080p_kdcu6b.mp4", // your Short link
      poster: "/posters/oar2.jpg",           // optional custom image
      title: "Enjoy Every Moment",
      author: "",                         // optional
      tag: "LUBA mini 2 AWD 1000",                                  // optional
    }
  ] as GalleryVideo[],

  /**
   * Sales team contacts, shown on /contact-sales (PRD req 13 + 19).
   * REPLACE the placeholder phone/email/LINE id with the real ones.
   * lineQrImage — drop the LINE official-account QR into /public
   * (e.g. "/line-qr.png") and set the path; a "coming soon" frame
   * shows while it is null.
   */
  salesContact: {
    phone: "02-576-5555",
    email: "sales@raaspal.com",
    // LINE official account still pending — keep the placeholder id and the
    // "coming soon" QR frame (lineQrImage null) until the real one is issued.
    lineId: "@raaspal",
    lineQrImage: null as string | null,
  },
};

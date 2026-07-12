/**
 * Site-wide settings.
 *
 * heroVideoUrls — hero background videos, played one after another in a
 * loop (1, 2, 3, back to 1). To add yours:
 *   1. Drop the files in /public/videos, e.g. public/videos/hero-1.mp4
 *   2. List them here in play order:
 *        heroVideoUrls: ["/videos/hero-1.mp4", "/videos/hero-2.mp4", "/videos/hero-3.mp4"]
 *   (CDN URLs also work. MP4/H.264, ~1080p, a few MB each — keep them short.)
 *
 * While the list is empty, the hero shows the animated lawn scene instead.
 * heroVideoPoster is an optional still shown while the first video loads.
 */
export const siteConfig = {
  heroVideoUrls: ["/videos/Banner_C40.mp4", "/videos/Banner_Luba 3.mp4", "/videos/Banner_SPINO-E1.mp4"] as string[],
  heroVideoPoster: null as string | null,
};

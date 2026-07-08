/**
 * Site-wide settings.
 *
 * heroVideoUrl — when a hero video is ready, set this to its URL
 * (drop the file in /public, e.g. "/hero.mp4", or use a CDN link)
 * and the home hero will play it full-bleed with a legibility
 * overlay. While it is null, the hero shows the animated lawn
 * scene instead. heroVideoPoster is an optional still shown while
 * the video loads.
 */
export const siteConfig = {
  heroVideoUrl: null as string | null,
  heroVideoPoster: null as string | null,
};

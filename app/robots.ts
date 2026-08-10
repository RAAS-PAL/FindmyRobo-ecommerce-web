import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nothing here is secret — these routes are already protected — but they
      // are worthless in an index and crawling them wastes budget that should
      // go to product pages.
      disallow: [
        "/admin",
        "/api/",
        "/auth/",
        "/account",
        "/checkout",
        "/en/account",
        "/en/checkout",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

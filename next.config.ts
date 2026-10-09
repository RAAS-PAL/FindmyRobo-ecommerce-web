import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { mediaBaseUrl } from "./lib/media";
import { withPayload } from "@payloadcms/next/withPayload";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const media = new URL(mediaBaseUrl);

const nextConfig: NextConfig = {
  // next/image may optimise files from the S3 media host (lib/media.ts), e.g.
  // the homepage tiles' cut-outs. It follows NEXT_PUBLIC_MEDIA_BASE_URL.
  images: {
    remotePatterns: [
      { protocol: media.protocol.replace(":", "") as "https" | "http", hostname: media.hostname, pathname: "/**" },
    ],
  },
  async headers() {
    return [
      {
        /* Next serves /public with `max-age=0`, so the hero videos were being
           re-downloaded on every navigation — a language switch cost another
           full fetch. These files are versioned by filename (hero-1, hero-2…),
           so they can be cached hard; rename the file to bust the cache. */
        source: "/videos/:file*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

// withPayload adds what the embedded CMS (/cms, payload.config.ts) needs from
// the bundler, on top of the next-intl config.
export default withPayload(withNextIntl(nextConfig));

import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageAlternates } from "@/lib/seo";
import { organizationJsonLd } from "@/lib/structuredData";
import { getSiteContent } from "@/lib/siteContentStore";
import JsonLd from "@/components/seo/JsonLd";
import HeroSection from "@/components/sections/HeroSection";
import ProductGrid from "@/components/sections/ProductGrid";
import FeatureShowcase from "@/components/sections/FeatureShowcase";
import VideoShowcase from "@/components/sections/VideoShowcase";
import TrustSection from "@/components/sections/TrustSection";
import WhyUsSection from "@/components/sections/WhyUsSection";
import YouTubeCTA from "@/components/sections/YouTubeCTA";

// Title and description come from the layout (Admin → Content → SEO); the homepage
// only needs to claim its own canonical, which the layout deliberately no
// longer sets (see lib/seo.ts for why).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: pageAlternates(locale, "/") };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { contact } = await getSiteContent();

  return (
    <main>
      {/* Who runs this site — feeds Google's brand panel and is the seller the
          product pages' offers point back to. Homepage only; one declaration
          per site is the convention. */}
      <JsonLd data={organizationJsonLd(contact)} />
      <HeroSection />
      <ProductGrid />
      <FeatureShowcase />
      <VideoShowcase />
      <TrustSection />
      <WhyUsSection />
      {/* NewsSection is hidden for launch — the items in messages/*.json "news"
          are placeholder posts about Mammotion, not FindMyRobo's own news. The
          component and its copy are still in the repo: re-import it and drop
          <NewsSection /> back here once there are real posts to show. */}
      <YouTubeCTA />
    </main>
  );
}

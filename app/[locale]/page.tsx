import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageAlternates } from "@/lib/seo";
import { organizationJsonLd } from "@/lib/structuredData";
import { getSiteContent } from "@/lib/siteContentStore";
import JsonLd from "@/components/seo/JsonLd";
import HeroSection from "@/components/sections/HeroSection";
import ProductGrid from "@/components/sections/ProductGrid";
import { FamilyBanner } from "@/components/sections/RobotShowcase";
import { featuredFamilies, onShow } from "@/data/homeShowcase";
import { getAllProducts } from "@/lib/productStore";
import VideoShowcase from "@/components/sections/VideoShowcase";
import ServicePromise from "@/components/sections/ServicePromise";
import { pick } from "@/data/siteContent";

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
  const [{ contact, home, about }, products] = await Promise.all([getSiteContent(), getAllProducts()]);
  // banners for robots still hidden in Admin (no photos yet) are left out
  const [phantas] = onShow([featuredFamilies[1]], products);

  return (
    <main>
      {/* Who runs this site — feeds Google's brand panel and is the seller the
          product pages' offers point back to. Homepage only; one declaration
          per site is the convention. */}
      <JsonLd data={organizationJsonLd(contact)} />
      {/* Fewer, larger sections (2026-11-20): the hero, the robot range, one
          banner, the videos, then who we are. The delivery and cooking
          robots are in the hero tabs, the range and the menu; the quote form
          opens from Get a quote. */}
      <HeroSection />
      <ProductGrid />
      {phantas && <FamilyBanner family={phantas} />}
      <VideoShowcase />
      {/* who we are: one section, its facts and promises shared with About */}
      <ServicePromise
        heading={pick(home.trustHeading, locale)}
        body={pick(home.trustBody, locale)}
        photo={about.storyImage}
        photoAlt={pick(home.trustHeading, locale)}
        facts={about.stats.map((stat) => ({ value: stat.value, label: pick(stat.label, locale) }))}
        promises={about.values.map((value) => ({ title: pick(value.title, locale), body: pick(value.body, locale) }))}
      />
    </main>
  );
}

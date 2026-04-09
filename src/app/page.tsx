import type { Metadata } from "next";
import Hero from "@/components/Hero";
import FeatureSection from "../components/FeatureSection";
import PopularProductLineup from "@/components/PopularProductLineup";
import ProductCategory from "@/components/ProductCategory";
import ServicesSection from "@/components/ServicesSection";
import Certificates from "@/components/Certificates";
import AwardsCarousel from "@/components/AwardsCarousel";
import NewsHomeSection from "@/components/NewsHomeSection";
import BusinessNeedsSection from "@/components/BusinessNeedsSection";
import AchievementsSection from "@/components/AchievementsSection";
import { getAllBannersByPageType } from "./(private)/admin/banners/models/banners-model";

export const metadata: Metadata = {
  title:
    "Mytechon – Innovative Electronics & Smart Tech Accessories | Official Site",
  description:
    "Mytechon (mytechon.net) is a leading B2B supplier of innovative smartphone accessories, smart electronics, and tech solutions. Established in 2015, AyyanTech delivers quality products worldwide.",
};

export default async function Home() {
  const homepageBannersResult = await getAllBannersByPageType("homepage");
  const homepageBanners = homepageBannersResult.success
    ? homepageBannersResult.data
    : [];
  const featuredBannerResult = await getAllBannersByPageType("featured");
  const featuredBanner = featuredBannerResult.success
    ? featuredBannerResult.data
    : [];

  return (
    <main className="min-h-screen w-full">
      <h1 className="sr-only">
        Mytechon – Innovative Electronics & Smart Tech Accessories
      </h1>
      <Hero banners={homepageBanners} />
      <FeatureSection featuredBanner={featuredBanner} />
      <PopularProductLineup />
      <AchievementsSection />
      <ProductCategory showDesktopNavigation={true} />
      <ServicesSection />
      <BusinessNeedsSection />
      <Certificates heading="Certificates" />
      <AwardsCarousel />
      <NewsHomeSection showViewAll={false} />
    </main>
  );
}

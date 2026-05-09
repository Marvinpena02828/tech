import type { Metadata } from "next";
import Hero from "@/components/Hero";
import PopularProductLineup from "@/components/PopularProductLineup";
import FeatureSection from "../components/FeatureSection";
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
    "Techon – Power Banks, Wall chargers, Car Chargers. Smaller, Cooler, Faster. 
High-performance charging solutions | Official Site",
  description:
    "Techon (tech-on.net) is a leading B2B supplier of innovative smartphone accessories, smart electronics, and tech solutions. Established in 2015, AyyanTech delivers quality products worldwide.",
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
        Techon – Innovative Electronics & Smart Tech Accessories
      </h1>
      <Hero banners={homepageBanners} />
            <PopularProductLineup />
      <FeatureSection featuredBanner={featuredBanner} />

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

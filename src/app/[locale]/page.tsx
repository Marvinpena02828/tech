import type { Metadata } from "next";
import Hero from "@/components/Hero";
import PopularProductLineup from "@/components/PopularProductLineup";
import FeatureSection from "@/components/FeatureSection";
import ProductCategory from "@/components/ProductCategory";
import ServicesSection from "@/components/ServicesSection";
import Certificates from "@/components/Certificates";
import AwardsCarousel from "@/components/AwardsCarousel";
import NewsHomeSection from "@/components/NewsHomeSection";
import BusinessNeedsSection from "@/components/BusinessNeedsSection";
import AchievementsSection from "@/components/AchievementsSection";
import { getAllBannersByPageType } from "@/app/(private)/admin/banners/models/banners-model";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const finalLocale = locale || "en";

  const metadataMap = {
    en: {
      title: "Techon – Power Banks, Wall chargers, Car Chargers. High-performance charging solutions",
      description:
        "Techon (tech-on.net) is a leading B2B supplier of innovative smartphone accessories, smart electronics, and tech solutions. Established in 2015, delivers quality products worldwide.",
    },
    zh: {
      title: "Techon – 移动电源、壁式充电器、车载充电器。高性能充电解决方案",
      description:
        "Techon（tech-on.net）是创新智能手机配件、智能电子产品和技术解决方案的领先B2B供应商。成立于2015年，提供全球优质产品。",
    },
    ar: {
      title: "Techon – بنوك الطاقة وشواحن الحائط وشواحن السيارات. حلول الشحن عالية الأداء",
      description:
        "Techon (tech-on.net) هو مورد B2B رائد لملحقات الهواتف الذكية المبتكرة والمنتجات الإلكترونية الذكية وحلول التكنولوجيا. تأسست عام 2015، توفر منتجات عالية الجودة في جميع أنحاء العالم.",
    },
  };

  const currentMeta = metadataMap[finalLocale as keyof typeof metadataMap] || metadataMap.en;

  return {
    title: currentMeta.title,
    description: currentMeta.description,
    alternates: {
      canonical: `https://tech-on.net/${finalLocale}`,
      languages: {
        en: "https://tech-on.net/en",
        zh: "https://tech-on.net/zh",
        ar: "https://tech-on.net/ar",
      },
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const finalLocale = locale || "en";

  const homepageBannersResult = await getAllBannersByPageType("homepage");
  const homepageBanners = homepageBannersResult.success
    ? homepageBannersResult.data
    : [];
  const featuredBannerResult = await getAllBannersByPageType("featured");
  const featuredBanner = featuredBannerResult.success
    ? featuredBannerResult.data
    : [];

  // SEO structured data
  const schemaData = {
    en: "Techon – Innovative Electronics & Smart Tech Accessories",
    zh: "Techon – 创新电子产品和智能技术配件",
    ar: "Techon – المنتجات الإلكترونية المبتكرة وملحقات التكنولوجيا الذكية",
  };

  return (
    <main className="min-h-screen w-full">
      <h1 className="sr-only">
        {schemaData[finalLocale as keyof typeof schemaData] || schemaData.en}
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

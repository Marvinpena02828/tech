import HeroBanner from "@/app/about/components/HeroBanner";
import CompanyAchievements from "@/app/about/components/CompanyAchievements";
import TimelineSection from "@/app/about/components/TimelineSection";
import GlobalMarketing from "@/app/about/components/GlobalMarketing";
import ProductCategory from "@/components/ProductCategory";
import CompanyProfile from "@/app/about/components/CompanyProfile";
import Image from "next/image";
import Certificates from "@/components/Certificates"; // Already updated to CMS-driven
import { isSectionVisible } from "../(private)/admin/settings/models/section-settings-model";
import { getMarketingPhotos } from "../(private)/admin/about-marketing/models/marketing-photos-model";
import { transformImageToProxy } from "@/lib/utils/image-proxy";

export const metadata = {
  title: "About Tech-On – Our Story, Mission & Vision | Tech-On Technology",
  description:
    "Learn about Tech-On (TechOn Technology), established in 2015. We specialize in R&D, product design, manufacturing, and global distribution of innovative tech accessories.",
  alternates: {
    canonical: "https://tech-on.net/about",
  },
};

const items = [
  {
    image: "/about/employees.jpg",
    title: "More than 100 Employees",
    description:
      "With a workforce significantly exceeding 100 specialized employees focused on quality and development.",
  },
  {
    image: "/about/exhibition.png",
    title: "Global Presence & Industry Leadership",
    description:
      "Industry Exhibition Excellence As a recurring participant in the world's premier technology expos, Ayyan has successfully pivoted toward Artificial Intelligence and smart integration. We have evolved beyond hardware manufacturing to provide sophisticated, software-integrated power solutions that meet the demands of a connected world.",
  },
  {
    image: "/about/manufacture.jpg",
    title: "Manufacturing & Operational Standards",
    description:
      "Excellence in Production Our manufacturing facilities adhere to the most rigorous international benchmarks for quality, environmental sustainability, and social accountability. By integrating ethical labor practices with high-efficiency automation, we guarantee that every product is a result of responsible and superior craftsmanship.",
  },
  {
    image: "/about/teamValues.jpg",
    title: "Our Team & Core Values",
    description: `The Heart of Ayyan Innovations Our growth is fueled by a specialized workforce of over 100 industry professionals dedicated to R&D, quality assurance, and global development. We are united by a foundational philosophy that guides every product we create:
Practicality | Reliability | User-Centric Design
Our mission is to evolve into a global brand defined by both its technological value and its commitment to humanity."`,
  },
];

export default async function AboutPage() {
  const [showGlobalMarketing, { data: dbPhotos }] = await Promise.all([
    isSectionVisible("global_marketing"),
    getMarketingPhotos(),
  ]);

  // Active photos from DB, already sorted by sort_order server-side
  const marketingItems = (dbPhotos ?? [])
    .filter((p) => p.is_active)
    .map((p) => ({
      image: transformImageToProxy(p.image_url),
      title: p.title,
      description: p.description,
    }));

  return (
    <>
      <main>
        <HeroBanner />
        <CompanyProfile />
        <CompanyAchievements />
        <TimelineSection />
        {/* Now CMS-driven: fetches from database */}
        <Certificates heading="Guaranteed Quality" />

        <ProductCategory showDesktopNavigation={true} />
        {showGlobalMarketing && <GlobalMarketing />}
        {/* Marketing Photos Grid */}
        {marketingItems.length > 0 && (
          <section className="bg-white w-full mt-2">
            <div className="slim-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-ful font-arial bg-white py-6">
              {marketingItems.map((item, index) => (
                <div key={index} className="flex flex-col gap-4">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={500}
                    height={300}
                    className="object-cover w-full h-full aspect-4/6 flex-1"
                  />

                  <div className="flex-1">
                    <h1 className="text-xl font-bold h-14">{item.title}</h1>
                    <p className="text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

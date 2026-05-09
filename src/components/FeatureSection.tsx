"use client";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import AppImage from "@/components/ui/AppImage";
import { ProductBanner } from "@/lib/types";
import Link from "next/link";

interface FeatureSectionProps {
  featuredBanner?: ProductBanner[] | [];
}

export default function FeatureSection({
  featuredBanner,
}: FeatureSectionProps) {
  const { ref } = useScrollReveal({ threshold: 0.2 });

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="w-full mt-2 py-20 bg-white"
    >
      <div className="container pt-8 pb-4">
        <div style={{ maxWidth: "1280px", margin: "0 auto", paddingLeft: "1rem", paddingRight: "1rem", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", color: "#111827" }}>
            Featured Products
          </h2>

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredBanner?.map((banner, index) => (
              <div key={index} className="relative aspect-video w-full">
                {/* Mobile Image */}
                <Link
                  href={banner.item_link || "#"}
                  target={banner.item_link ? "_blank" : "_self"}
                >
                  <div className="sm:hidden w-full">
                    <AppImage
                      src={
                        banner?.mobile_banner ||
                        "/Images/featured-section/image2.avif"
                      }
                      alt="105W GaNFast Multi-Port"
                      fill
                      className="object-cover rounded-xl"
                      sizes="100vw"
                      priority
                      unoptimized={!!featuredBanner}
                    />
                  </div>
                </Link>
                {/* Desktop Image */}
                <Link
                  href={banner.item_link || "#"}
                  target={banner.item_link ? "_blank" : "_self"}
                >
                  <div className="hidden sm:block">
                    <AppImage
                      src={
                        banner?.desktop_banner ||
                        "/Images/featured-section/image2.avif"
                      }
                      alt="105W GaNFast Multi-Port"
                      fill
                      className="object-cover rounded-xl"
                      priority
                      unoptimized={!!featuredBanner}
                    />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
     
    </section>
  );
}

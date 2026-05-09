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
      <div className="container mx-auto px-4 pt-8 pb-4">
        <h2 style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", color: "#111827", marginBottom: "2rem" }}>
          Featured Products
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredBanner?.map((banner, index) => (
            <Link
              key={index}
              href={banner.item_link || "#"}
              target={banner.item_link ? "_blank" : "_self"}
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-xl cursor-pointer hover:opacity-90 transition-opacity">
                {/* Mobile Image */}
                <div className="sm:hidden w-full h-full">
                  <AppImage
                    src={
                      banner?.mobile_banner ||
                      "/Images/featured-section/image2.avif"
                    }
                    alt={banner?.item_title || "Featured Product"}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority
                    unoptimized={!!featuredBanner}
                  />
                </div>

                {/* Desktop Image */}
                <div className="hidden sm:block w-full h-full">
                  <AppImage
                    src={
                      banner?.desktop_banner ||
                      "/Images/featured-section/image2.avif"
                    }
                    alt={banner?.item_title || "Featured Product"}
                    fill
                    className="object-cover"
                    priority
                    unoptimized={!!featuredBanner}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

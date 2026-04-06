"use client";

import React from "react";
import Image from "next/image";
import { ProductBanner } from "@/lib/types";
import { parseFontSetting } from "./Hero";

// Helper function to get proper font family and weight based on selection
const getFontStyles = (fontFamily: string | null | undefined) => {
  if (!fontFamily) return { fontFamily: "Arial", fontWeight: 400 };

  // Check if the fontFamily contains a colon (new format: "FontName:weight")
  if (fontFamily.includes(":")) {
    const [family, weightStr] = fontFamily.split(":");
    const weight = parseInt(weightStr, 10);
    return { fontFamily: family, fontWeight: isNaN(weight) ? 400 : weight };
  }

  // Map font selections to their CSS properties (legacy format support)
  const fontMap: Record<string, { fontFamily: string; fontWeight: number }> = {
    Arial: { fontFamily: "Arial", fontWeight: 400 },
    Arial_bold: { fontFamily: "Arial_bold", fontWeight: 700 },
    "Mukta Mahee": { fontFamily: "Mukta Mahee", fontWeight: 400 },
    Neuropol: { fontFamily: "Neuropol", fontWeight: 400 },
    MyriadPro: { fontFamily: "MyriadPro", fontWeight: 400 },
    "MyriadPro Condensed": {
      fontFamily: "MyriadPro Condensed",
      fontWeight: 400,
    },
    Play: { fontFamily: "Play", fontWeight: 400 },
    Poppins: { fontFamily: "Poppins", fontWeight: 400 },
    "SF Pro Display": { fontFamily: "SF Pro Display", fontWeight: 400 },
  };

  // Check if it's in the simple map
  if (fontMap[fontFamily]) {
    return fontMap[fontFamily];
  }

  // Default fallback
  return { fontFamily: fontFamily, fontWeight: 400 };
};

interface BannerProps {
  banner: ProductBanner | null;
  placeholderText?: string;
}

const ResponsiveBanner = ({
  banner,
  placeholderText = "Put your banner here",
}: BannerProps) => {
  if (!banner) {
    return (
      <section className="relative  h-[300px] lg:h-[400px] bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-600">
            {placeholderText}
          </p>
          <p className="text-lg sm:text-xl text-gray-500 mt-4">
            Recommended size: Mobile 768x400px, Desktop 1920x400px
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative max-md:aspect-[160/231] md:h-[300px] lg:h-[500px] overflow-hidden">
      {/* Mobile Banner - visible on screens smaller than lg (1024px) */}
      <div className="md:hidden absolute inset-0 z-0">
        <Image
          src={banner.mobile_banner}
          alt="Mobile banner"
          fill
          className="object-contain"
          priority
          unoptimized
        />
      </div>

      {/* Desktop Banner - visible on screens lg (1024px) and larger */}
      <div className="hidden md:block absolute inset-0 z-0">
        <Image
          src={banner.desktop_banner}
          alt="Desktop banner"
          fill
          className="object-cover"
          priority
          unoptimized
        />
      </div>

      {/* 3-Line Banner Heading Overlay - Only show if banner has any heading lines */}
      {(banner.heading_line1 ||
        banner.heading_line2 ||
        banner.heading_line3) && (
        <div
          className={`absolute bottom-0 inset-0 z-20 flex items-start lg:items-center text-center lg:text-left transition-opacity duration-1000 `}
        >
          <div className="container mx-auto px-4 md:px-8 lg:px-16 h-full">
            <div className="max-w-3xl space-y-1 lg:space-y-2 h-full pt-10 pb-16 lg:py-16 flex flex-col justify-start lg:justify-center">
              {banner.heading_line1 && (
                <div
                  className="leading-tight"
                  style={{
                    color: banner.line1_color || "#ffffff",
                    fontSize: `clamp(20px, 8vw, ${Number(banner.line1_font_size) * 0.6 || "48"}px)`,
                    ...parseFontSetting(banner.line1_font_family),
                  }}
                  dangerouslySetInnerHTML={{ __html: banner.heading_line1 }}
                />
              )}
              {banner.heading_line2 && (
                <div
                  className="leading-tight mt-2"
                  style={{
                    color: banner.line2_color || "#ffffff",
                    fontSize: `clamp(20px, 7vw, ${Number(banner.line2_font_size) * 0.6 || "48"}px)`,
                    ...parseFontSetting(banner.line2_font_family),
                  }}
                  dangerouslySetInnerHTML={{ __html: banner.heading_line2 }}
                />
              )}
              {banner.heading_line3 && (
                <div
                  className="leading-tight mt-6 md:mt-10"
                  style={{
                    color: banner.line3_color || "#ffffff",
                    fontSize: `clamp(18px, 6vw, ${Number(banner.line3_font_size) * 0.6 || "48"}px)`,
                    ...parseFontSetting(banner.line3_font_family),
                  }}
                  dangerouslySetInnerHTML={{ __html: banner.heading_line3 }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ResponsiveBanner;

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ProductBanner } from "@/lib/types";

export const parseFontSetting = (fontSetting: string | null | undefined) => {
  if (!fontSetting)
    return { fontFamily: '"Arial", sans-serif', fontWeight: "700" };

  const [familyRaw, weightRaw] = fontSetting.split(":");
  const family = familyRaw;
  let weight = weightRaw || "400";

  if (family === "Arial_bold") {
    weight = "700";
  }

  return {
    fontFamily: `"${family}", Arial, sans-serif`,
    fontWeight: weight,
  };
};

interface HeroProps {
  banners: ProductBanner[];
}

export default function HeroBanner({ banners }: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHoveringDots, setIsHoveringDots] = useState(false);

  useEffect(() => {
    if (banners.length <= 1 || !isAutoPlay || isHoveringDots) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [banners.length, isAutoPlay, isHoveringDots]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleDotsMouseEnter = () => {
    setIsHoveringDots(true);
  };

  const handleDotsMouseLeave = () => {
    setIsHoveringDots(false);
    setIsAutoPlay(true);
  };

  if (banners.length === 0) {
    return (
      <section className="relative h-[550px] w-full bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-600">
            Add Homepage Banners
          </p>
          <p className="text-lg sm:text-xl text-gray-500 mt-4">
            Go to Admin → Banners to add homepage carousel images or videos
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden">
      {/* Carousel Container */}
      <div className="relative w-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`relative w-full transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0 absolute"
            }`}
          >
            {/* MOBILE - Video if available, else image */}
            <div className="block md:hidden">
              {banner.mobile_video ? (
                <video
                  src={banner.mobile_video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-auto"
                />
              ) : banner.mobile_banner ? (
                <Image
                  src={banner.mobile_banner}
                  alt={`Mobile Banner ${index + 1}`}
                  width={800}
                  height={600}
                  className="w-full h-auto"
                  priority={index === 0}
                  quality={75}
                  unoptimized
                />
              ) : null}
            </div>

            {/* TABLET & DESKTOP - Video if available, else image */}
            <div className="hidden md:block">
              {banner.desktop_video ? (
                <video
                  src={banner.desktop_video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-auto"
                />
              ) : banner.desktop_banner ? (
                <Image
                  src={banner.desktop_banner}
                  alt={`Desktop Banner ${index + 1}`}
                  width={1600}
                  height={900}
                  className="w-full h-auto"
                  priority={index === 0}
                  quality={100}
                  unoptimized
                />
              ) : null}
            </div>

            {/* 3-Line Banner Heading Overlay */}
            {(banner.heading_line1 ||
              banner.heading_line2 ||
              banner.heading_line3) && (
              <div className="absolute inset-0 z-20 flex items-start md:items-center text-center md:text-left">
                <div className="container mx-auto px-4 md:px-8 lg:px-16 w-full">
                  <div className="max-w-3xl space-y-1 md:space-y-2 pt-10 pb-16 md:py-16">
                    {banner.heading_line1 && (
                      <div
                        className="leading-tight"
                        style={{
                          color: banner.line1_color || "#ffffff",
                          fontSize: `clamp(20px, 8vw, ${Number(banner.line1_font_size) * 0.6 || "48"}px)`,
                          ...parseFontSetting(banner.line1_font_family),
                          textShadow:
                            "2px 2px 8px rgba(0,0,0,0.8), 0 0 25px rgba(0,0,0,0.5)",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: banner.heading_line1,
                        }}
                      />
                    )}
                    {banner.heading_line2 && (
                      <div
                        className="leading-tight mt-2"
                        style={{
                          color: banner.line2_color || "#ffffff",
                          fontSize: `clamp(20px, 7vw, ${Number(banner.line2_font_size) * 0.6 || "48"}px)`,
                          ...parseFontSetting(banner.line2_font_family),
                          textShadow:
                            "2px 2px 8px rgba(0,0,0,0.8), 0 0 25px rgba(0,0,0,0.5)",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: banner.heading_line2,
                        }}
                      />
                    )}
                    {banner.heading_line3 && (
                      <div
                        className="leading-tight mt-6 md:mt-10"
                        style={{
                          color: banner.line3_color || "#ffffff",
                          fontSize: `clamp(18px, 6vw, ${Number(banner.line3_font_size) * 0.6 || "48"}px)`,
                          ...parseFontSetting(banner.line3_font_family),
                          textShadow:
                            "2px 2px 8px rgba(0,0,0,0.8), 0 0 25px rgba(0,0,0,0.5)",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: banner.heading_line3,
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dots Navigation */}
      {banners.length > 1 && (
        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex gap-3"
          onMouseEnter={handleDotsMouseEnter}
          onMouseLeave={handleDotsMouseLeave}
        >
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentIndex
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

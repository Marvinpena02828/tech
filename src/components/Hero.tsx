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
      {/* MOBILE: Dynamic height based on image */}
      <div className="lg:hidden relative w-full bg-white">
        {banners.map((banner, index) => (
          <React.Fragment key={banner.id}>
            {banner.mobile_video ? (
              <video
                src={banner.mobile_video}
                autoPlay
                muted
                loop
                playsInline
                className={`w-full h-auto block transition-opacity duration-1000 ${
                  index === currentIndex ? "opacity-100" : "opacity-0 absolute"
                }`}
              />
            ) : banner.mobile_banner ? (
              <Image
                src={banner.mobile_banner}
                alt={`Mobile Banner ${index + 1}`}
                width={600}
                height={800}
                className={`w-full h-auto block transition-opacity duration-1000 ${
                  index === currentIndex ? "opacity-100" : "opacity-0 absolute"
                }`}
                priority={index === 0}
                quality={75}
                unoptimized
              />
            ) : null}

            {/* Heading Overlay Mobile */}
            {(banner.heading_line1 ||
              banner.heading_line2 ||
              banner.heading_line3) && (
              <div
                className={`absolute inset-0 z-20 flex items-start text-center transition-opacity duration-1000 ${
                  index === currentIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="container mx-auto px-4 w-full h-full">
                  <div className="max-w-3xl space-y-1 h-full pt-10 pb-16 flex flex-col justify-start">
                    {banner.heading_line1 && (
                      <div
                        className="leading-tight"
                        style={{
                          color: banner.line1_color || "#ffffff",
                          fontSize: `clamp(16px, 6vw, 32px)`,
                          ...parseFontSetting(banner.line1_font_family),
                          textShadow:
                            "2px 2px 8px rgba(0,0,0,0.8), 0 0 25px rgba(0,0,0,0.5)",
                        }}
                        dangerouslySetInnerHTML={{ __html: banner.heading_line1 }}
                      />
                    )}
                    {banner.heading_line2 && (
                      <div
                        className="leading-tight mt-2"
                        style={{
                          color: banner.line2_color || "#ffffff",
                          fontSize: `clamp(14px, 5vw, 28px)`,
                          ...parseFontSetting(banner.line2_font_family),
                          textShadow:
                            "2px 2px 8px rgba(0,0,0,0.8), 0 0 25px rgba(0,0,0,0.5)",
                        }}
                        dangerouslySetInnerHTML={{ __html: banner.heading_line2 }}
                      />
                    )}
                    {banner.heading_line3 && (
                      <div
                        className="leading-tight mt-4"
                        style={{
                          color: banner.line3_color || "#ffffff",
                          fontSize: `clamp(12px, 4vw, 24px)`,
                          ...parseFontSetting(banner.line3_font_family),
                          textShadow:
                            "2px 2px 8px rgba(0,0,0,0.8), 0 0 25px rgba(0,0,0,0.5)",
                        }}
                        dangerouslySetInnerHTML={{ __html: banner.heading_line3 }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* DESKTOP/TABLET: Fixed heights with proper aspect ratio */}
      <div className="hidden lg:block relative h-[700px] w-full overflow-hidden bg-black">
        {banners.map((banner, index) => (
          <React.Fragment key={banner.id}>
            {/* Tablet */}
            <div
              className={`absolute inset-0 z-0 transition-opacity duration-1000 hidden md:block lg:hidden ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              {banner.desktop_video ? (
                <video
                  src={banner.desktop_video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : banner.desktop_banner ? (
                <Image
                  src={banner.desktop_banner}
                  alt={`Tablet Banner ${index + 1}`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={index === 0}
                  quality={85}
                  unoptimized
                />
              ) : null}
            </div>

            {/* Desktop */}
            <div
              className={`absolute inset-0 z-0 transition-opacity duration-1000 hidden lg:block ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              {banner.desktop_video ? (
                <video
                  src={banner.desktop_video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : banner.desktop_banner ? (
                <Image
                  src={banner.desktop_banner}
                  alt={`Desktop Banner ${index + 1}`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={index === 0}
                  quality={100}
                  unoptimized
                />
              ) : null}
            </div>

            {/* Desktop Heading Overlay */}
            {(banner.heading_line1 ||
              banner.heading_line2 ||
              banner.heading_line3) && (
              <div
                className={`absolute inset-0 z-20 hidden lg:flex items-center text-left transition-opacity duration-1000 ${
                  index === currentIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="container mx-auto px-4 md:px-8 lg:px-16 h-full">
                  <div className="max-w-3xl space-y-2 h-full py-16 flex flex-col justify-center">
                    {banner.heading_line1 && (
                      <div
                        className="leading-tight"
                        style={{
                          color: banner.line1_color || "#ffffff",
                          fontSize: `clamp(32px, 8vw, 64px)`,
                          ...parseFontSetting(banner.line1_font_family),
                          textShadow:
                            "2px 2px 8px rgba(0,0,0,0.8), 0 0 25px rgba(0,0,0,0.5)",
                        }}
                        dangerouslySetInnerHTML={{ __html: banner.heading_line1 }}
                      />
                    )}
                    {banner.heading_line2 && (
                      <div
                        className="leading-tight"
                        style={{
                          color: banner.line2_color || "#ffffff",
                          fontSize: `clamp(28px, 7vw, 56px)`,
                          ...parseFontSetting(banner.line2_font_family),
                          textShadow:
                            "2px 2px 8px rgba(0,0,0,0.8), 0 0 25px rgba(0,0,0,0.5)",
                        }}
                        dangerouslySetInnerHTML={{ __html: banner.heading_line2 }}
                      />
                    )}
                    {banner.heading_line3 && (
                      <div
                        className="leading-tight mt-4"
                        style={{
                          color: banner.line3_color || "#ffffff",
                          fontSize: `clamp(20px, 6vw, 48px)`,
                          ...parseFontSetting(banner.line3_font_family),
                          textShadow:
                            "2px 2px 8px rgba(0,0,0,0.8), 0 0 25px rgba(0,0,0,0.5)",
                        }}
                        dangerouslySetInnerHTML={{ __html: banner.heading_line3 }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
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

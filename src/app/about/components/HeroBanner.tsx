"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function HeroBanner() {
  const supabase = createClient();
  const [banner, setBanner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBannerData();
  }, []);

  const fetchBannerData = async () => {
    try {
      const { data, error } = await supabase
        .from("hero_banner")
        .select("*")
        .eq("is_active", true)
        .single();

      if (data) {
        setBanner(data);
      } else if (error) {
        console.error("Error fetching banner:", error);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !banner) {
    return (
      <section className="relative h-[500px] w-full overflow-hidden bg-gray-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        height: `${banner.banner_height}px`,
      }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${banner.banner_image_url}')`,
        }}
      />

      {/* Overlay */}
      {banner.overlay_enabled && (
        <div
          className="absolute inset-0 z-5"
          style={{
            backgroundColor: banner.overlay_color,
            opacity: banner.overlay_opacity,
          }}
        />
      )}

      {/* Content */}
      <div
        className="absolute z-10 flex flex-col items-center gap-2 px-4"
        style={{
          left: `${banner.text_position_left}%`,
          top: `${banner.text_position_top}%`,
          transform: "translate(-50%, -50%)",
          textAlign: banner.text_alignment,
        }}
      >
        <span
          className={`${banner.primary_text_size} ${banner.primary_text_color} font-semibold tracking-widest hidden sm:block`}
        >
          {banner.primary_text}
        </span>
        <span
          className={`${banner.secondary_text_size} ${banner.secondary_text_color} font-bold uppercase tracking-wider`}
        >
          {banner.secondary_text}
        </span>

        {/* CTA Button */}
        {banner.cta_button_enabled && (
          <a
            href={banner.cta_button_link}
            className={`${banner.cta_button_color} text-white px-6 py-2 rounded-lg font-medium mt-4 hover:opacity-90 transition-opacity inline-block`}
          >
            {banner.cta_button_text}
          </a>
        )}
      </div>

      {/* Responsive height adjustments */}
      <style jsx>{`
        @media (max-width: 768px) {
          section {
            height: ${banner.responsive_mobile_height}px;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          section {
            height: ${banner.responsive_tablet_height}px;
          }
        }
      `}</style>
    </section>
  );
}

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface ContactBannerData {
  id?: string;
  banner_image_url: string;
  banner_height: number;
  banner_title: string;
  title_color: string;
  title_size: string;
  title_position_top: number;
  title_position_left: number;
  overlay_enabled: boolean;
  overlay_color: string;
  overlay_opacity: number;
  is_active: boolean;
}

export default function ContactBanner() {
  const supabase = createClient();
  const [banner, setBanner] = useState<ContactBannerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBannerData();
  }, []);

  const fetchBannerData = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("contact_banner")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.error("Supabase fetch error:", error);
        return;
      }

      if (data) {
        setBanner(data);
      }
    } catch (err: any) {
      console.error("Error fetching banner:", err);
    } finally {
      setLoading(false);
    }
  };

  // Default banner data
  const defaultBanner: ContactBannerData = {
    banner_image_url: "/contact/banner.png",
    banner_height: 500,
    banner_title: "Contact Us",
    title_color: "text-black",
    title_size: "text-5xl",
    title_position_top: 85,
    title_position_left: 7,
    overlay_enabled: false,
    overlay_color: "rgba(0,0,0,0.3)",
    overlay_opacity: 0.3,
    is_active: true,
  };

  const displayBanner = banner || defaultBanner;

  if (loading) {
    return (
      <section
        className="relative w-full overflow-hidden bg-gradient-to-r from-gray-200 to-gray-300"
        style={{ height: `${defaultBanner.banner_height}px` }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: `${displayBanner.banner_height}px` }}
    >
      {/* Background Image */}
      {displayBanner.banner_image_url && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${displayBanner.banner_image_url}')`,
          }}
        />
      )}

      {/* Overlay */}
      {displayBanner.overlay_enabled && (
        <div
          className="absolute inset-0 z-5"
          style={{
            backgroundColor: displayBanner.overlay_color,
            opacity: displayBanner.overlay_opacity,
          }}
        />
      )}

      {/* Content */}
      <div
        className="absolute z-10 px-4"
        style={{
          bottom: `${100 - displayBanner.title_position_top}%`,
          left: `${displayBanner.title_position_left}%`,
          transform: "translateY(50%)",
        }}
      >
        <h1
          className={`${displayBanner.title_color} font-semibold ${displayBanner.title_size}`}
        >
          {displayBanner.banner_title}
        </h1>
      </div>
    </section>
  );
}

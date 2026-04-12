"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function HeroBanner() {
  const supabase = createClient();
  const [banner, setBanner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBannerData();

    // Real-time subscription
    const subscription = supabase
      .channel("hero_banner_updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "hero_banner" },
        (payload) => {
          console.log("Real-time banner update received:", payload);
          setBanner(payload.new);
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchBannerData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("hero_banner")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      if (fetchError) {
        console.error("Supabase fetch error:", fetchError);
        setError(fetchError.message);
        return;
      }

      if (data) {
        console.log("Banner loaded:", data);
        setBanner(data);
      } else {
        console.log("No active banner found");
        setBanner(null);
      }
    } catch (err: any) {
      console.error("Error fetching banner:", err);
      setError(err?.message || "Failed to fetch banner");
    } finally {
      setLoading(false);
    }
  };

  const defaultBanner = {
    banner_image_url: "/about/banner.jpg",
    banner_height: 500,
    overlay_enabled: true,
    overlay_color: "rgba(0,0,0,0.3)",
    overlay_opacity: 0.3,
    primary_text: "Empowered by",
    primary_text_color: "text-violet-950",
    primary_text_size: "text-3xl",
    secondary_text: "INNOVATIONS",
    secondary_text_color: "text-red-700",
    secondary_text_size: "text-2xl",
    text_position_left: 60,
    text_position_top: 25,
    text_alignment: "center",
    cta_button_enabled: false,
    cta_button_text: "Learn More",
    cta_button_link: "#",
    cta_button_color: "bg-blue-600",
  };

  const displayBanner = banner || defaultBanner;

  if (loading) {
    return (
      <section
        className="relative w-full overflow-hidden bg-gradient-to-r from-gray-200 to-gray-300"
        style={{ height: `${defaultBanner.banner_height}px` }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Loading banner...</div>
        </div>
      </section>
    );
  }

  if (error) {
    console.warn("Banner error, showing fallback:", error);
  }

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        height: `${displayBanner.banner_height}px`,
      }}
    >
      {/* Background Image */}
      {displayBanner.banner_image_url && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${displayBanner.banner_image_url}')`,
            backgroundPosition: "center",
            backgroundSize: "cover",
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
        className="absolute z-10 flex flex-col items-center gap-2 px-4"
        style={{
          left: `${displayBanner.text_position_left}%`,
          top: `${displayBanner.text_position_top}%`,
          transform: "translate(-50%, -50%)",
          textAlign: displayBanner.text_alignment as any,
        }}
      >
        {/* Primary Text - Hidden on mobile */}
        <span
          className={`${displayBanner.primary_text_size} ${displayBanner.primary_text_color} font-semibold tracking-widest hidden sm:block`}
        >
          {displayBanner.primary_text}
        </span>

        {/* Secondary Text */}
        <span
          className={`${displayBanner.secondary_text_size} ${displayBanner.secondary_text_color} font-bold uppercase tracking-wider`}
        >
          {displayBanner.secondary_text}
        </span>

        {/* CTA Button */}
        {displayBanner.cta_button_enabled && displayBanner.cta_button_link && (
          <a
            href={displayBanner.cta_button_link}
            className={`${displayBanner.cta_button_color} text-white px-6 py-2 rounded-lg font-medium mt-4 hover:opacity-90 transition-opacity inline-block`}
          >
            {displayBanner.cta_button_text}
          </a>
        )}
      </div>

      {/* Responsive height adjustments */}
      <style jsx>{`
        @media (max-width: 768px) {
          section {
            height: ${displayBanner.responsive_mobile_height || 350}px;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          section {
            height: ${displayBanner.responsive_tablet_height || 400}px;
          }
        }
      `}</style>
    </section>
  );
}

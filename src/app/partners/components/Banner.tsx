"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface BannerImage {
  id: string;
  platform: "mobile" | "desktop";
  imageUrl: string;
  altText: string;
}

const Banner = () => {
  const supabase = createClient();
  const [banners, setBanners] = useState<Record<string, string>>({
    desktop: "/partners/banner.jpg", // Fallback
    mobile: "/partners/banner-mobile.jpg", // Fallback
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("partners_banners")
        .select("*");

      if (error) throw error;

      if (data && data.length > 0) {
        const bannerMap: Record<string, string> = {};
        data.forEach((banner: any) => {
          // Map lowercase database columns to interface
          bannerMap[banner.platform] = banner.imageurl; // imageurl not imageUrl
        });
        setBanners((prev) => ({ ...prev, ...bannerMap }));
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
      // Use fallback images on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="relative max-md:aspect-video md:h-[500px] overflow-hidden bg-gray-200">
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-gray-600">Loading banner...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative max-md:aspect-video md:h-[500px] overflow-hidden">
      {/* Background Image - Mobile */}
      {banners.mobile && (
        <Image
          src={banners.mobile}
          alt="Partners Banner Mobile"
          fill
          className="object-fill w-full block lg:hidden"
          priority
          quality={90}
        />
      )}
      
      {/* Background Image - Desktop */}
      {banners.desktop && (
        <Image
          src={banners.desktop}
          alt="Partners Banner Desktop"
          fill
          className="object-fill w-full hidden lg:block"
          priority
          quality={90}
        />
      )}
    </section>
  );
};

export default Banner;

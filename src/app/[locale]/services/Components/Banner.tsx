'use client';

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Banner() {
  const [bannerImage, setBannerImage] = useState<string>("/services/page/Our Services.png");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        // Add timestamp to bypass all caching
        const timestamp = Date.now();
        const response = await fetch(`/api/banner?t=${timestamp}`, {
          cache: 'no-store'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("[Banner] Fetched data:", data);
          
          if (data.image) {
            console.log("[Banner] Setting image to:", data.image);
            setBannerImage(data.image);
          }
        } else {
          console.error("[Banner] API error:", response.status);
        }
      } catch (error) {
        console.error("[Banner] Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, []);

  return (
    <section className="relative max-md:aspect-video md:h-[500px] overflow-hidden bg-gray-200">
      {loading ? (
        <div className="w-full h-full bg-gray-300 animate-pulse" />
      ) : (
        <>
          {/* Mobile Version */}
          <Image
            src={bannerImage}
            alt="Our Services"
            fill
            className="object-cover w-full block md:hidden scale-110"
            priority
            quality={90}
          />
          
          {/* Desktop Version */}
          <Image
            src={bannerImage}
            alt="Our Services"
            fill
            className="object-cover w-full hidden md:block"
            priority
            quality={90}
          />
        </>
      )}
    </section>
  );
}

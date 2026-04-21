'use client';

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Banner() {
  const [bannerImage, setBannerImage] = useState<string>("/achievements/page/Our Achievements.png");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const timestamp = Date.now();
        const response = await fetch(`/api/banner?t=${timestamp}`, {
          cache: 'no-store'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("[Achievement Banner] Fetched data:", data);
          
          if (data.image) {
            console.log("[Achievement Banner] Setting image to:", data.image);
            setBannerImage(data.image);
          }
        } else {
          console.error("[Achievement Banner] API error:", response.status);
        }
      } catch (error) {
        console.error("[Achievement Banner] Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, []);

  return (
    <section className="relative max-md:aspect-video md:h-[500px] overflow-hidden">
      {loading ? (
        <div className="w-full h-full bg-gray-300 animate-pulse" />
      ) : (
        <>
          {/* Mobile Version */}
          <Image
            src={bannerImage}
            alt="Our Achievements"
            fill
            className="object-contain w-full block md:hidden"
            priority
            quality={75}
          />
          {/* Desktop Version */}
          <Image
            src={bannerImage}
            alt="Our Achievements"
            fill
            className="object-cover w-full hidden md:block"
            priority
            quality={75}
          />
        </>
      )}
      <h1 className="absolute top-[5%] left-[60%] w-full lg:left-[12%] transform -translate-x-1/2 -translate-y-1/2 text-black text-4xl">
        Our Achievements
      </h1>
    </section>
  );
}

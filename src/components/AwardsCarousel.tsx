"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

interface Award {
  id: string;
  images: string[];
  display_order: number;
  is_active: boolean;
}

export default function AwardsCarousel() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const { data, error } = await supabase
          .from("awards")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) throw error;
        
        // Flatten all images from all awards
        const allImages = data
          ?.flatMap((award) => award.images || [])
          .filter((img) => img) || [];
        
        setAwards(
          allImages.map((img, idx) => ({
            id: `${idx}`,
            images: [img],
            display_order: idx,
            is_active: true,
          }))
        );
      } catch (err) {
        console.error("Error fetching awards:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAwards();
  }, []);

  if (loading) {
    return null;
  }

  if (awards.length === 0) {
    return null;
  }

  // Duplicate awards for seamless infinite loop
  const duplicatedAwards = [...awards, ...awards, ...awards];

  return (
    <section className="w-full py-16 bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Title */}
      <div className="container mx-auto px-4 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900">
          Awards
        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto mt-4 rounded-full" />
      </div>

      {/* Marquee Container */}
      <div
        className="relative w-full overflow-hidden py-8"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left gradient overlay */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white to-transparent z-20 pointer-events-none" />
        
        {/* Right gradient overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white to-transparent z-20 pointer-events-none" />

        {/* Scrolling container */}
        <div
          className="flex gap-12 md:gap-16 px-4"
          style={{
            animation: `marquee 50s linear infinite ${isPaused ? 'paused' : 'running'}`,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {duplicatedAwards.map((award, idx) => (
            <div
              key={`${award.id}-${idx}`}
              className="flex-shrink-0 flex items-center justify-center group"
            >
              <div className="relative w-32 h-20 md:w-40 md:h-24 lg:w-48 lg:h-28 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Image
                  src={award.images[0]}
                  alt={`Award ${idx}`}
                  fill
                  className="object-contain filter brightness-90 hover:brightness-100 transition-all duration-300"
                  priority={false}
                  sizes="(max-width: 768px) 128px, (max-width: 1024px) 160px, 192px"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 3));
          }
        }
      `}</style>
    </section>
  );
}

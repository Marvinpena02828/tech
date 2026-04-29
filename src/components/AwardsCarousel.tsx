"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

interface Award {
  id: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

export default function AwardsCarousel() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const { data, error } = await supabase
          .from("awards")
          .select("id, images, display_order, is_active")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) {
          console.error("Supabase error:", error);
          setError(`Database error: ${error.message}`);
          return;
        }

        if (!data || data.length === 0) {
          console.warn("No active awards found");
          setAwards([]);
          return;
        }

        // Flatten images from all awards into individual Award objects
        const allAwards: Award[] = [];
        data.forEach((award: any, idx: number) => {
          const images = Array.isArray(award.images) ? award.images : [];
          images.forEach((img: string, imgIdx: number) => {
            if (img && img.trim()) {
              allAwards.push({
                id: `award-${award.id}-${imgIdx}`,
                image_url: img,
                display_order: award.display_order || idx,
                is_active: true,
              });
            }
          });
        });

        console.log("✅ Fetched awards:", allAwards);
        setAwards(allAwards);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error("❌ Error fetching awards:", errorMsg);
        setError(`Error: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAwards();
  }, [supabase]);

  if (loading) {
    return (
      <section className="w-full py-16">
        <div className="container mx-auto px-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900">
            Awards
          </h2>
        </div>
        <div className="text-center text-gray-500">Loading awards...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full py-16">
        <div className="container mx-auto px-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900">
            Awards
          </h2>
        </div>
        <div className="text-center text-red-500 text-sm p-4 bg-red-50 rounded">
          {error}
        </div>
      </section>
    );
  }

  if (awards.length === 0) {
    return null;
  }

  // Duplicate awards for seamless infinite loop
  const duplicatedAwards = [...awards, ...awards, ...awards];

  return (
    <section className="w-full py-16">
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
          className="flex gap-12 md:gap-16 px-4 will-change-transform"
          style={{
            animation: `marquee 60s linear infinite`,
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {duplicatedAwards.map((award, idx) => (
            <div
              key={`${award.id}-${idx}`}
              className="flex-shrink-0 flex items-center justify-center group"
            >
              <div className="relative w-32 h-20 md:w-40 md:h-24 lg:w-48 lg:h-28 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 overflow-hidden">
                <img
                  src={award.image_url}
                  alt={`Award ${award.id}`}
                  className="w-full h-full object-contain transition-all duration-300"
                  onError={(e) => {
                    console.error(`❌ Failed to load: ${award.image_url}`);
                    // Fallback: show placeholder
                    const img = e.currentTarget as HTMLImageElement;
                    img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 100'%3E%3Crect fill='transparent' width='200' height='100'/%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='14'%3EImage Not Found%3C/text%3E%3C/svg%3E";
                  }}
                  onLoad={() => {
                    console.log(`✅ Loaded: ${award.image_url.substring(0, 50)}...`);
                  }}
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

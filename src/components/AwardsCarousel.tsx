"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Award {
  id: string;
  image_url: string;
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
          .select("id, image_url")
          .eq("is_active", true)
          .order("display_order", { ascending: true })
          .limit(5);

        if (error) throw error;

        setAwards(data || []);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(`Error loading awards: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAwards();
  }, [supabase]);

  if (loading) return null;
  if (error) return null;
  if (awards.length === 0) return null;

  // Duplicate 3x for seamless loop
  const scrollAwards = [...awards, ...awards, ...awards];

  return (
    <section className="w-screen -mx-[calc(50vw-50%)] py-12 bg-white overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 mb-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          Awards & Recognition
        </h2>
        <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto" />
      </div>

      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="flex gap-8 px-4"
          style={{
            animation: isPaused ? "none" : "scrollAwards 60s linear infinite",
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {scrollAwards.map((award, idx) => (
            <div
              key={`${award.id}-${idx}`}
              className="flex-shrink-0 flex items-center justify-center"
            >
              <img
                src={award.image_url}
                alt={`Award - ${award.id}`}
                className="h-32 w-auto object-contain hover:scale-105 transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          ))}
        </div>

        {/* Gradient fade effect on sides */}
        <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-white to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      </div>

      <style>{`
        @keyframes scrollAwards {
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

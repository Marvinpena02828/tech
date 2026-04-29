"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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

  const preloadImage = (url: string): Promise<void> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = url;
    });
  };

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const { data, error } = await supabase
          .from("awards")
          .select("id,images,is_active,display_order")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
          setAwards([]);
          return;
        }

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

        setAwards(allAwards);

        const preloadPromises = allAwards.map((award) =>
          preloadImage(award.image_url)
        );
        await Promise.all(preloadPromises);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(`Error: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAwards();
  }, [supabase]);

  if (loading) {
    return (
      <section style={{ width: "100%", padding: "3rem 0", backgroundColor: "transparent" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", color: "#111827" }}>
          Awards
        </h2>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{ width: "100%", padding: "3rem 0", backgroundColor: "transparent" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", color: "#111827" }}>
          Awards
        </h2>
        <div style={{ textAlign: "center", color: "#dc2626", fontSize: "0.875rem" }}>{error}</div>
      </section>
    );
  }

  if (awards.length === 0) {
    return null;
  }

  const duplicatedAwards = [...awards, ...awards, ...awards];

  return (
    <section style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)", padding: "3rem 0", backgroundColor: "transparent" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", paddingLeft: "1rem", paddingRight: "1rem", marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", color: "#111827" }}>
          Awards
        </h2>
        <div style={{ 
          width: "4rem", 
          height: "0.25rem", 
          background: "linear-gradient(to right, rgb(59, 130, 246), rgb(6, 182, 212))", 
          margin: "1rem auto 0",
          borderRadius: "9999px"
        }} />
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          padding: "2rem 0",
          backgroundColor: "transparent"
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          style={{
            display: "flex",
            gap: "3rem",
            padding: "0 1rem",
            animation: isPaused ? "none" : "marquee 80s linear infinite",
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {duplicatedAwards.map((award, idx) => (
            <div
              key={`${award.id}-${idx}`}
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={award.image_url}
                alt={`Award ${award.id}`}
                style={{
                  width: "12rem",
                  height: "7rem",
                  objectFit: "contain",
                  animation: "fadeIn 0.3s ease-in forwards",
                }}
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.style.display = "none";
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </section>
  );
}

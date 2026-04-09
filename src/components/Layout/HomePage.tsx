"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface PromotionalBar {
  message: string;
  background_color: string;
  text_color: string;
  is_active: boolean;
}

export default function HomePage({ children }: { children?: React.ReactNode }) {
  const [promoBar, setPromoBar] = useState<PromotionalBar | null>(null);
  const [showPromoBar, setShowPromoBar] = useState(true);
  const supabase = createClient();

  // Fetch active promotional bar
  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const { data, error } = await supabase
          .from("promotional_bars")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") throw error;
        if (data) {
          setPromoBar(data);
        }
      } catch (err) {
        console.error("Error fetching promotional bar:", err);
      }
    };

    fetchPromo();
  }, []);

  // Handle scroll to hide/show promo bar
  useEffect(() => {
    let lastScroll = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScroll && currentScrollY > 100) {
        setShowPromoBar(false);
      } else if (currentScrollY < lastScroll) {
        setShowPromoBar(true);
      }

      if (currentScrollY < 10) {
        setShowPromoBar(true);
      }

      lastScroll = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Promotional Bar - appears below Header (top: 80px) */}
      {promoBar && promoBar.is_active && (
        <div
          className="fixed left-0 right-0 w-full z-40 transition-all duration-300"
          style={{
            backgroundColor: promoBar.background_color,
            top: showPromoBar ? "80px" : "-60px",
            opacity: showPromoBar ? 1 : 0,
          }}
        >
          <div className="w-full px-4 md:px-8 py-3 flex items-center justify-between">
            <p
              className="text-sm md:text-base font-medium text-center flex-1 max-w-4xl mx-auto"
              style={{ color: promoBar.text_color }}
            >
              {promoBar.message}
            </p>
            <button
              onClick={() => setShowPromoBar(false)}
              className="ml-4 p-1 hover:opacity-70 transition-opacity flex-shrink-0"
              aria-label="Close promotional bar"
              style={{ color: promoBar.text_color }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content - children render here */}
      {children}
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface PromotionalBar {
  message: string;
  background_color: string;
  text_color: string;
  is_active: boolean;
}

export default function HomePage() {
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
    <div>
      {/* Promotional Bar */}
      {promoBar && promoBar.is_active && (
        <div
          className={`fixed top-20 md:top-24 w-full z-30 transition-all duration-300 transform ${
            showPromoBar
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0"
          }`}
          style={{ backgroundColor: promoBar.background_color }}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-12 py-3 flex items-center justify-between">
            <p
              className="text-sm md:text-base font-medium text-center flex-1"
              style={{ color: promoBar.text_color }}
            >
              {promoBar.message}
            </p>
            <button
              onClick={() => setShowPromoBar(false)}
              className="ml-4 p-1 hover:opacity-70 transition-opacity"
              aria-label="Close promotional bar"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Home Page Content */}
      <main className={promoBar && promoBar.is_active && showPromoBar ? "pt-16 md:pt-20" : ""}>
        {/* Your existing home page content goes here */}
        
        <section className="py-20 px-4 md:px-12 max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold mb-6">Welcome to AyyanTech</h1>
          <p className="text-xl text-gray-600 mb-8">
            Leading the future of technology innovation
          </p>
          
          {/* Add your existing home page sections here */}
        </section>
      </main>
    </div>
  );
}

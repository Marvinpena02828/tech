"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

interface GlobalMarketingData {
  id: number;
  countries_count: number;
  major_customers_count: number;
  description: string;
  regions: string;
}

export default function GlobalMarketing() {
  const supabase = createClient();
  const [marketing, setMarketing] = useState<GlobalMarketingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketing();
  }, []);

  const fetchMarketing = async () => {
    try {
      const { data, error } = await supabase
        .from("global_marketing")
        .select("*")
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setMarketing(data);
    } catch (error) {
      console.error("Error fetching marketing data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !marketing) {
    return null;
  }

  const regions = marketing.regions.split(",").map((r) => r.trim());

  return (
    <section className="py-8 bg-white mt-2">
      <h2 className="heading text-center text-black mb-6 md:mb-10">
        Offline Marketing
      </h2>

      <div className="container font-arial">
        <div className="flex flex-col md:flex-row gap-14">
          {/* Header */}
          <div className="flex-1 text-center lg:text-left lf:mb-16 flex flex-col">
            <h3 className="text-xl md:text-2xl text-[#3A2E59] mb-4">
              Exporting to over {marketing.countries_count} Countries and
              Regions Worldwide
            </h3>
            <p className="text-lg md:text-lg text-gray-700 max-w-3xl">
              {regions.join(" l ")}
            </p>

            {/* Total Stats */}
            <div className="mt-auto text-[#3A2E59]">
              <div className="inline-flex items-start gap-2 max-md:mt-6 md:gap-14">
                <div>
                  <div className="text-4xl font-semibold">
                    {marketing.countries_count}+
                  </div>
                  <div className="text-lg mt-1">Countries/Regions</div>
                </div>
                <div>
                  <div className="text-4xl font-semibold">
                    {marketing.major_customers_count}+
                  </div>
                  <div className="text-lg mt-1">Global Major Customers</div>
                </div>
              </div>
            </div>
          </div>

          {/* World Map Section */}
          <div className="relative w-full aspect-20/9 flex-1/8">
            <Image
              src="/about/worldmap.png"
              alt="Global Distribution Map"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

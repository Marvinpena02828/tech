"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Award, Star, Medal, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Honor {
  id: number;
  title: string;
  year: string;
  image_url?: string;
  icon_type: string;
  sort_order: number;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  trophy: Trophy,
  star: Star,
  medal: Medal,
  award: Award,
};

export default function CompanyHonors() {
  const supabase = createClient();
  const [honors, setHonors] = useState<Honor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHonors();
  }, []);

  const fetchHonors = async () => {
    try {
      const { data, error } = await supabase
        .from("company_honors")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setHonors(data || []);
    } catch (error) {
      console.error("Error fetching honors:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || honors.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-[#00CED1] tracking-widest mb-4">
            COMPANY HONORS
          </h2>
          <div className="w-20 h-1 bg-[#00CED1] mx-auto mb-6" />
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            Recognition of our commitment to excellence and innovation in the
            industry.
          </p>
        </div>

        {/* Honors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {honors.map((honor, index) => {
            const IconComponent = iconMap[honor.icon_type] || Trophy;
            return (
              <div
                key={honor.id}
                className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
                style={{
                  animation: `fadeInUp 0.7s ease-out ${index * 0.1}s both`,
                }}
              >
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-[#3A2E59]/5 to-[#00CED1]/5">
                  {honor.image_url ? (
                    <Image
                      src={honor.image_url}
                      alt={honor.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                      <IconComponent size={64} className="text-blue-300" />
                    </div>
                  )}

                  {/* Icon Overlay */}
                  <div className="absolute top-4 right-4 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                    <IconComponent size={24} className="text-[#00CED1]" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-bold text-[#00CED1] bg-[#00CED1]/10 px-3 py-1 rounded-full">
                      {honor.year}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#3A2E59] group-hover:text-[#00CED1] transition-colors">
                    {honor.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}

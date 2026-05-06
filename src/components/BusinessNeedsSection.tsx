"use client";
import React, { useEffect, useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface PartnerItem {
  id: string;
  title: string;
  detail: string;
}

interface CustomerCategory {
  id: string;
  type: string;
  description: string;
  items: PartnerItem[];
  displayOrder: number;
}

export default function BusinessNeedsSection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.2 });
  const supabase = createClient();
  const [categories, setCategories] = useState<CustomerCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("partners_categories")
        .select("id, type, description, items, displayOrder")
        .order("displayOrder", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load partners");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="w-full py-20 bg-white mt-2"
    >
      <div className="container">
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div style={{ maxWidth: "1280px", margin: "0 auto", paddingLeft: "1rem", paddingRight: "1rem", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", color: "#111827" }}>Who Are Our Partners?</h2>
            <div style={{
              width: "4rem",
              height: "0.25rem",
              background: "linear-gradient(to right, rgb(59, 130, 246), rgb(6, 182, 212))",
              margin: "1rem auto 0",
              borderRadius: "9999px"
            }} />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 text-gray-600">
            Loading partners...
          </div>
        )}

        {/* Desktop Grid View (Hidden on Mobile/Tablet) */}
        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] w-full gap-16 lg:gap-8">
            {categories.map((item, index) => (
              <div
                key={item.id}
                className={`grid h-full transition-all duration-700 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{
                  gridTemplateRows: "20% 20% 50% 20%",
                  transitionDelay: `${index * 100 + 200}ms`,
                  transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)",
                }}
              >
                <h3 className="text-base lg:text-xl font-arial font-bold mb-3 lg:mb-4 text-gray-900">
                  {item.type}
                </h3>
                <p className="text-sm lg:text-md text-gray-600 mb-3 font-semibold lg:mb-4">
                  {item.description}
                </p>
                <ul className="list-disc list-inside text-sm lg:text-md text-gray-600 mb-6 lg:mb-8 space-y-1 lg:space-y-2 leading-4">
                  {item.items && item.items.map((point, idx) => (
                    <div className="flex items-center gap-2" key={point.id || idx}>
                      <Image
                        src="/check.png"
                        alt="icon"
                        width={15}
                        height={15}
                        className="object-cover aspect-square"
                      />
                      <p>{point.title}</p>
                    </div>
                  ))}
                </ul>
                <Link
                  href={`/partners#partners-${item.id}`}
                  className="mt-auto block max-w-[150px] button-animation py-1 lg:py-2 text-center px-6 rounded-full border border-gray-200 shadow-sm text-sm lg:text-base transition-all duration-300 hover:shadow-md hover:scale-105 hover:bg-[#1a1a3a]"
                >
                  Learn More
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && categories.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            No partners available yet.
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  order: number;
}

export default function ServicesSection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.3 });
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        console.log("📍 ServicesSection mounting");
        const response = await fetch("/api/services", { cache: "no-store" });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log("📍 Data loaded:", data);

        if (Array.isArray(data) && data.length > 0) {
          const sorted = data.sort((a, b) => a.order - b.order).slice(0, 4);
          console.log("📍 Services set:", sorted);
          setServices(sorted);
        } else {
          console.log("📍 No data returned or not an array");
          setServices([]);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        console.error("📍 Error:", msg);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  console.log("📍 Render - loading:", loading, "services:", services.length, "error:", error);

  // Loading state
  if (loading) {
    return (
      <section className="w-full py-16 bg-amber-100 border-4 border-amber-400">
        <div className="container px-4">
          <p className="text-center text-amber-900 font-bold">Loading Services...</p>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="w-full py-16 bg-red-100 border-4 border-red-400">
        <div className="container px-4">
          <p className="text-center text-red-900 font-bold">❌ Error: {error}</p>
        </div>
      </section>
    );
  }

  // Empty state
  if (services.length === 0) {
    return (
      <section className="w-full py-16 bg-yellow-100 border-4 border-yellow-400">
        <div className="container px-4">
          <p className="text-center text-yellow-900 font-bold">No services found</p>
        </div>
      </section>
    );
  }

  // Success - render services
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="w-full py-16 bg-green-100 border-4 border-green-400 mt-2"
    >
      <div className="container px-4">
        {/* Header */}
        <h2
          className={`text-4xl font-bold text-center text-green-900 mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Our Services ({services.length})
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, idx) => (
            <Link
              href={`/services#service-${idx}`}
              key={service.id}
              className={`group bg-white rounded-lg p-4 border-2 border-green-400 hover:border-green-600 transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: `${idx * 100 + 200}ms`,
              }}
            >
              {/* Image */}
              {service.image && (
                <div className="relative w-full h-24 mb-3 rounded-lg overflow-hidden bg-gray-200 border-2 border-green-300">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="100px"
                  />
                </div>
              )}

              {/* Content */}
              <h3 className="font-bold text-green-900 text-sm mb-2">
                {service.title}
              </h3>
              <p className="text-xs text-gray-700 line-clamp-2">
                {service.description.replace(/<[^>]*>/g, "")}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

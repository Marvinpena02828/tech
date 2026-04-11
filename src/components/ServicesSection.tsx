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

  useEffect(() => {
    fetch("/api/services", { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setServices(data.sort((a, b) => a.order - b.order).slice(0, 4));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="w-full py-16 bg-white border-t border-gray-100 mt-2">
        <div className="container px-4">
          <div className="h-8 w-40 bg-gray-200 rounded mx-auto mb-12 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (services.length === 0) return null;

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="w-full py-16 bg-white border-t border-gray-100 mt-2"
    >
      <div className="container px-4">
        {/* Header */}
        <h2
          className={`heading text-center text-gray-800 mb-12 font-arial transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Our Services
        </h2>

        {/* Services Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, idx) => (
            <Link
              href={`/services#service-${idx}`}
              key={service.id}
              className={`group flex flex-col gap-3 transition-all duration-700 cursor-pointer ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: `${idx * 100 + 200}ms`,
                transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)",
              }}
            >
              {/* Image Container - Clickable */}
              <div className="relative w-full h-24 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-transparent group-hover:border-red-500 transition-all duration-300">
                {service.image ? (
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="100px"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                    <span className="text-2xl font-bold text-red-500">{idx + 1}</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="font-bold text-sm md:text-base text-gray-900 group-hover:text-red-600 transition-colors duration-300 line-clamp-2">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-gray-600 line-clamp-2 group-hover:text-gray-800 transition-colors duration-300">
                {service.description.replace(/<[^>]*>/g, "")}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

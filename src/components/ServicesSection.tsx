"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ServicesSection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.3 });
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/services", { cache: "no-store" })
      .then(async (r) => {
        const json = await r.json();
        setData(json);
      })
      .catch(() => {
        setData([]);
      });
  }, []);

  if (!data) {
    return (
      <section className="w-full py-20 bg-white border-t border-gray-100 mt-2">
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

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const services = data.sort((a: any, b: any) => a.order - b.order).slice(0, 4);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="w-full py-20 bg-white border-t border-gray-100 mt-2"
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
          {services.map((service: any, idx: number) => (
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
              {/* Image Container */}
              {service.image && (
                <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group-hover:border-blue-400 transition-all duration-300">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* Title */}
              <h3 className="font-bold text-sm md:text-base text-gray-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
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

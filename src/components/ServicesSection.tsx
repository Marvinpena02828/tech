"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  order: number;
}

// Simple SVG icons as fallback
const IconCircle = ({ number }: { number: number }) => {
  const icons = [
    // Icon 1 - Document/Clipboard
    <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500 w-10 h-10">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
      <polyline points="13 2 13 9 20 9"></polyline>
    </svg>,
    // Icon 2 - Shield
    <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500 w-10 h-10">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>,
    // Icon 3 - Building
    <svg key="3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500 w-10 h-10">
      <polyline points="12 3 20 7 20 19 4 19 4 7 12 3"></polyline>
      <line x1="12" y1="12" x2="20" y2="12"></line>
      <line x1="12" y1="16" x2="20" y2="16"></line>
      <line x1="8" y1="12" x2="8" y2="16"></line>
    </svg>,
    // Icon 4 - Checkmark
    <svg key="4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500 w-10 h-10">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>,
  ];

  return icons[number] || icons[0];
};

export default function ServicesSection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.3 });
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching services...");

        const response = await fetch("/api/services", {
          cache: "no-store",
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Data received:", data);

        if (Array.isArray(data)) {
          const sorted = data
            .sort((a: Service, b: Service) => a.order - b.order)
            .slice(0, 4);
          console.log("Services set:", sorted);
          setServices(sorted);
        } else {
          console.warn("Data is not an array");
          setServices([]);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        console.error("Error:", errorMsg);
        setError(errorMsg);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
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

  if (error) {
    return (
      <section className="w-full py-16 bg-white border-t border-gray-100 mt-2">
        <div className="container px-4">
          <h2 className="heading text-center text-gray-800 mb-12 font-arial">
            Our Services
          </h2>
          <div className="text-center p-6 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700">Error: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (services.length === 0) {
    return null;
  }

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
        <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-8">
          {services.map((service, idx) => (
            <Link
              href={`/services#service-${idx}`}
              key={service.id}
              className={`flex flex-col items-center text-center transition-all duration-700 group ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: `${idx * 100 + 200}ms`,
                transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)",
              }}
            >
              {/* Icon Circle */}
              <div className="mb-4 relative">
                <div className="w-20 h-20 rounded-full border-2 border-red-500 flex items-center justify-center group-hover:bg-red-50 transition-colors duration-300">
                  <IconCircle number={idx} />
                </div>
                {/* Hover ring effect */}
                <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-red-300 opacity-0 group-hover:opacity-100 scale-125 transition-all duration-300"></div>
              </div>

              {/* Content */}
              <h3 className="font-bold text-sm md:text-base text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-300 line-clamp-2">
                {service.title}
              </h3>
              <p className="text-xs text-gray-600 line-clamp-3 group-hover:text-gray-800 transition-colors duration-300">
                {service.description.replace(/<[^>]*>/g, "")}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

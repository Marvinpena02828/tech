"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FileText, Shield, Building2, CheckCircle } from "lucide-react";

interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  order: number;
}

const iconMap = [
  FileText,
  Shield,
  Building2,
  CheckCircle,
];

export default function ServicesSection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.3 });
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/services", {
          cache: "no-store",
        });

        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();
        if (Array.isArray(data)) {
          const sorted = data
            .sort((a: Service, b: Service) => a.order - b.order)
            .slice(0, 4);
          setServices(sorted);
        }
      } catch (error) {
        console.error("Error loading services:", error);
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
          {services.map((service, idx) => {
            const IconComponent = iconMap[idx] || FileText;

            return (
              <Link
                href={`/services#service-${idx}`}
                key={service.id}
                className={`flex flex-col items-center text-center transition-all duration-700 hover:scale-105 ${
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
                <div className="mb-4 relative group">
                  <div className="w-20 h-20 rounded-full border-2 border-red-500 flex items-center justify-center group-hover:bg-red-50 transition-colors duration-300">
                    <IconComponent size={40} className="text-red-500" />
                  </div>
                  {/* Hover effect - outer ring */}
                  <div className="absolute inset-0 w-20 h-20 rounded-full border-2 border-red-300 opacity-0 group-hover:opacity-100 scale-125 transition-all duration-300"></div>
                </div>

                {/* Content */}
                <h3 className="font-bold text-sm md:text-base text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-3 group-hover:text-gray-800 transition-colors duration-300">
                  {service.description.replace(/<[^>]*>/g, "")}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

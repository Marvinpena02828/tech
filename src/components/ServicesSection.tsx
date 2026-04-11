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
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("🔵 Fetching services from /api/services");
        
        const response = await fetch("/api/services", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        console.log("📊 Response status:", response.status);
        console.log("📊 Response ok:", response.ok);

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("✅ Services data received:", data);

        if (Array.isArray(data)) {
          // Limit to 4 services and sort by order
          const sortedServices = data
            .sort((a: Service, b: Service) => a.order - b.order)
            .slice(0, 4);
          console.log("✅ Sorted services:", sortedServices);
          setServices(sortedServices);
        } else {
          console.warn("⚠️ Data is not an array:", data);
          setServices([]);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("❌ Error fetching services:", errorMessage);
        setError(errorMessage);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <section className="w-full py-20 bg-white border-t border-gray-100 mt-2">
        <div className="container">
          <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-12 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="w-full py-20 bg-white border-t border-gray-100 mt-2">
        <div className="container">
          <h2 className="heading text-center text-gray-800 mb-12 font-arial">
            Our Services
          </h2>
          <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">Error loading services: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  // Show empty state
  if (services.length === 0) {
    return (
      <section className="w-full py-20 bg-white border-t border-gray-100 mt-2">
        <div className="container">
          <h2 className="heading text-center text-gray-800 mb-12 font-arial">
            Our Services
          </h2>
          <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700">No services available at the moment</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="w-full py-20 bg-white border-t border-gray-100 mt-2"
    >
      <div className="container">
        <h2
          className={`heading text-center text-gray-800 mb-12 font-arial transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Our Services
        </h2>

        <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4">
          {services.map((service, idx) => (
            <Link
              href={`/services#service-${idx}`}
              key={service.id}
              className={`flex items-start gap-2 transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: `${idx * 100 + 200}ms`,
                transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)",
              }}
            >
              <div className="relative min-w-22 h-22 overflow-hidden rounded-full aspect-square group hover:bg-primary-blue flex-shrink-0">
                <Image
                  src={service.image}
                  alt={service.title}
                  width={100}
                  height={100}
                  className="object-cover aspect-square group-hover:brightness-0 group-hover:invert transition-all duration-300 w-full h-full"
                  onError={(e) => {
                    console.error(`Image load error for service ${service.id}:`, service.image);
                    // Fallback to placeholder
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3C/svg%3E";
                  }}
                />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-sm md:text-[17px] text-gray-800 leading-5">
                  {service.title}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2">{service.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

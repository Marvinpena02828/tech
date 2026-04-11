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

        const response = await fetch("/api/services", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          const sortedServices = data
            .sort((a: Service, b: Service) => a.order - b.order)
            .slice(0, 4);
          setServices(sortedServices);
        } else {
          setServices([]);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Error fetching services:", errorMessage);
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
        <div className="container px-4">
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

  if (error) {
    return (
      <section className="w-full py-20 bg-white border-t border-gray-100 mt-2">
        <div className="container px-4">
          <h2 className="heading text-center text-gray-800 mb-12 font-arial">
            Our Services
          </h2>
          <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">Error: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (services.length === 0) {
    return (
      <section className="w-full py-20 bg-white border-t border-gray-100 mt-2">
        <div className="container px-4">
          <h2 className="heading text-center text-gray-800 mb-12 font-arial">
            Our Services
          </h2>
          <div className="text-center p-8">
            <p className="text-gray-600">Services will appear here soon</p>
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
      <div className="container px-4">
        <h2
          className={`heading text-center text-gray-800 mb-12 font-arial transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Our Services
        </h2>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service, idx) => (
            <Link
              href={`/services#service-${idx}`}
              key={service.id}
              className={`group flex flex-col gap-3 p-4 rounded-lg hover:bg-gray-50 transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: `${idx * 100 + 200}ms`,
                transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)",
              }}
            >
              {/* Service Image */}
              <div className="relative w-full h-24 overflow-hidden rounded-lg bg-gray-100 flex-shrink-0">
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

              {/* Service Content */}
              <div className="flex flex-col flex-1">
                <h3 className="font-bold text-sm md:text-base text-gray-800 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2 flex-1">
                  {service.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

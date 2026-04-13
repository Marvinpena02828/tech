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
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/services");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        // Limit to 4 services and sort by order
        setServices(data.sort((a: Service, b: Service) => a.order - b.order).slice(0, 4));
      } catch (error) {
        console.error("Error fetching services:", error);
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
              <div className="relative min-w-22 h-22 overflow-hidden rounded-full aspect-square group hover:bg-primary-blue">
                <Image
                  src={service.image}
                  alt={service.title}
                  width={1000}
                  height={1000}
                  className="object-cover aspect-square group-hover:brightness-0 group-hover:invert transition-all duration-300"
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

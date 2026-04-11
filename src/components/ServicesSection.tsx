"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  order: number;
}

export default function ServicesSection() {
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

  if (loading) return null;
  if (services.length === 0) return null;

  return (
    <section className="w-full py-16 bg-white border-t border-gray-100 mt-2">
      <div className="container px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Our Services
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {services.map((service, idx) => (
            <Link
              href={`/services#service-${idx}`}
              key={service.id}
              className="flex flex-col items-center text-center p-4 hover:bg-gray-50 rounded-lg transition"
            >
              {/* Icon Circle */}
              <div className="w-20 h-20 rounded-full border-2 border-red-500 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-red-500">{idx + 1}</span>
              </div>

              {/* Title */}
              <h3 className="font-bold text-base text-gray-900 mb-2">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-3">
                {service.description.replace(/<[^>]*>/g, "")}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import React from "react";
import Image from "next/image";

interface ProductCategory {
  id: number;
  name: string;
  image: string;
}

const categories: ProductCategory[] = [
  {
    id: 1,
    name: "Car Charger",
    image:
      "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&h=600&fit=crop&q=80",
  },
  {
    id: 2,
    name: "Charger",
    image:
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&h=600&fit=crop&q=80",
  },
  {
    id: 3,
    name: "Power Bank",
    image:
      "https://images.unsplash.com/photo-1609592806955-d0c4b3a82d5e?w=800&h=600&fit=crop&q=80",
  },
  {
    id: 4,
    name: "Wireless Charger",
    image:
      "https://images.unsplash.com/photo-1591290619762-d0c3e1e3e0e8?w=800&h=600&fit=crop&q=80",
  },
];

export default function ProductCategoriesPreview() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-[#00CED1] tracking-widest mb-4">
            PRODUCT CATEGORY
          </h2>
          <div className="w-20 h-1 bg-[#00CED1] mx-auto mb-6" />
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            Explore our diverse range of innovative charging solutions and
            accessories.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              {/* Image */}
              <div className="relative h-80 overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#3A2E59]/90 via-[#3A2E59]/40 to-transparent" />
              </div>

              {/* Text Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#00CED1] transition-colors">
                  {category.name}
                </h3>
                <div className="w-12 h-1 bg-[#00CED1] mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}

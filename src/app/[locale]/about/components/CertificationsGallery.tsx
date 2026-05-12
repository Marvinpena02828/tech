"use client";

import React from "react";
import Image from "next/image";

export default function CertificationsGallery() {
  const certifications = [
    {
      id: 1,
      name: "CE Certification",
      image: "https://placehold.co/800x1000/3A2E59/FFFFFF.png?text=CE",
    },
    {
      id: 2,
      name: "RoHS Certification",
      image: "https://placehold.co/800x1000/3A2E59/FFFFFF.png?text=RoHS",
    },
    {
      id: 3,
      name: "ISO 9001",
      image: "https://placehold.co/800x1000/3A2E59/FFFFFF.png?text=ISO+9001",
    },
    {
      id: 4,
      name: "FCC Certification",
      image: "https://placehold.co/800x1000/3A2E59/FFFFFF.png?text=FCC",
    },
    {
      id: 5,
      name: "UL Certification",
      image: "https://placehold.co/800x1000/3A2E59/FFFFFF.png?text=UL",
    },
    {
      id: 6,
      name: "PSE Certification",
      image: "https://placehold.co/800x1000/3A2E59/FFFFFF.png?text=PSE",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-[#00CED1] tracking-widest mb-4">
            GUARANTEED QUALITY
          </h2>
          <div className="w-20 h-1 bg-[#00CED1] mx-auto mb-6" />
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            We are committed to providing the highest quality products, backed
            by international certifications.
          </p>
        </div>

        {/* Certifications Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
          {certifications.map((cert, index) => (
            <div
              key={cert.id}
              className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 flex flex-col items-center justify-center"
              style={{
                animation: `fadeInScale 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              <div className="relative w-full aspect-[3/4] mb-4">
                <Image
                  src={cert.image}
                  alt={cert.name}
                  fill
                  className="object-contain group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                />
              </div>
              <p className="text-xs md:text-sm font-semibold text-[#3A2E59] text-center">
                {cert.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </section>
  );
}

"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useState } from "react";

export default function GuaranteedQuality() {
  const [selectedCert, setSelectedCert] = useState<number | null>(null);

  const certificates = [
    {
      id: 1,
      src: "/Images/Certificates/Certificate1.png",
      alt: "Certificate 1",
    },
    {
      id: 2,
      src: "/Images/Certificates/Certificate2.png",
      alt: "Certificate 2",
    },
    {
      id: 3,
      src: "/Images/Certificates/Certificate3.png",
      alt: "Certificate 3",
    },
    {
      id: 4,
      src: "/Images/Certificates/Certificate4.png",
      alt: "Certificate 4",
    },
  ];

  const handleNext = () => {
    if (selectedCert === null) return;
    const nextId = selectedCert === 4 ? 1 : selectedCert + 1;
    setSelectedCert(nextId);
  };

  const handlePrev = () => {
    if (selectedCert === null) return;
    const prevId = selectedCert === 1 ? 4 : selectedCert - 1;
    setSelectedCert(prevId);
  };

  return (
    <section className="w-full py-8 md:py-12 lg:py-16 bg-white flex flex-col items-center mx-auto overflow-hidden mb-2">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-arial text-gray-800 mb-8 md:mb-10 lg:mb-12 px-4 text-center">
        Guaranteed Quality
      </h2>

      {/* Desktop/Tablet Grid View */}
      <div className="hidden sm:grid w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="flex flex-col items-center group cursor-pointer"
            onClick={() => setSelectedCert(cert.id)}
          >
            <div className="w-full max-w-xs aspect-[3/4] bg-white border-2 border-gray-200 p-2 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden rounded-lg hover:border-purple-400 hover:scale-105">
              <Image
                src={cert.src}
                alt={cert.alt}
                width={250}
                height={333}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Horizontal Scroll */}
      <div className="sm:hidden w-full overflow-hidden">
        <div
          className="flex gap-4 px-4 pb-4 overflow-x-auto scrollbar-hide"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="flex flex-col items-center group cursor-pointer flex-shrink-0"
              onClick={() => setSelectedCert(cert.id)}
              style={{ scrollSnapAlign: "center" }}
            >
              <div className="w-56 aspect-[3/4] bg-white border-2 border-gray-200 p-2 shadow-md active:shadow-lg transition-all duration-300 overflow-hidden rounded-lg active:border-purple-400">
                <Image
                  src={cert.src}
                  alt={cert.alt}
                  width={250}
                  height={333}
                  className="w-full h-full object-contain transition-transform duration-300"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedCert !== null && (
        <div
          className="fixed inset-0 bg-black/70 z-40 animate-fade-in"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg md:rounded-2xl shadow-2xl w-[95vw] md:w-[90vw] max-w-4xl max-h-[90vh] flex flex-col relative z-50 animate-slide-up overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "clamp(280px, 95vw, 1024px)",
              height: "clamp(400px, 90vh, 90vh)",
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-3 right-3 md:top-4 md:right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 active:bg-gray-200 transition-colors z-20"
              aria-label="Close"
            >
              <X size={20} className="md:size-24 text-gray-700" />
            </button>

            {/* Certificate Image Container */}
            <div className="flex-1 flex items-center justify-center p-3 md:p-5 bg-gray-50 overflow-y-auto overflow-x-hidden pt-12 md:pt-8 text-center">
              <Image
                src={certificates[selectedCert - 1].src}
                alt={certificates[selectedCert - 1].alt}
                width={1200}
                height={1600}
                className="max-w-full max-h-[70vh] w-auto h-auto object-contain"
                priority
              />
            </div>

            {/* Navigation and Info */}
            <div className="p-3 md:p-5 bg-white border-t border-gray-200 flex items-center justify-between flex-shrink-0">
              <button
                onClick={handlePrev}
                className="px-3 py-2 md:px-6 md:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-colors font-medium text-sm md:text-base"
              >
                <span className="hidden sm:inline">← Previous</span>
                <span className="sm:hidden">←</span>
              </button>

              <span className="text-gray-600 font-medium text-xs md:text-base">
                {selectedCert}/{certificates.length}
              </span>

              <button
                onClick={handleNext}
                className="px-3 py-2 md:px-6 md:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-colors font-medium text-sm md:text-base"
              >
                <span className="hidden sm:inline">Next →</span>
                <span className="sm:hidden">→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

"use client";

import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function Certificates({
  heading = "Certificates",
}: {
  heading: string;
}) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.3 });
  const [selectedCert, setSelectedCert] = useState<number | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "right"
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const mobileItemsToShow = 1;

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
    {
      id: 5,
      src: "/Images/Certificates/Certificate5.jpg",
      alt: "Certificate 5",
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

  // Mobile carousel handlers
  const handleMobileNext = () => {
    if (startIndex < certificates.length - mobileItemsToShow) {
      setSlideDirection("right");
      setIsAnimating(true);
      setStartIndex((prev) => prev + 1);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const handleMobilePrev = () => {
    if (startIndex > 0) {
      setSlideDirection("left");
      setIsAnimating(true);
      setStartIndex((prev) => prev - 1);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const visibleMobileCerts = certificates.slice(
    startIndex,
    startIndex + mobileItemsToShow
  );

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="w-full py-20 bg-white flex flex-col items-center mx-auto overflow-hidden mt-2"
    >
      <div className="container">
        <h2 className="heading mb-8 md:mb-10 lg:mb-12 px-4 text-center">
          {heading}
        </h2>

        {/* Desktop/Tablet Grid View */}
        <div className="hidden w-full  sm:grid grid-cols-2 lg:grid-cols-5 gap-12 md:gap-20">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="flex flex-col items-center group cursor-pointer"
              onClick={() => setSelectedCert(cert.id)}
            >
              <div className="relative w-full max-w-sm aspect-[4/6] bg-white border-2 border-gray-200 p-2 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden rounded-lg hover:border-[#232250] hover:scale-105">
                <Image
                  src={cert.src}
                  alt={cert.alt}
                  fill
                  className="w-full h-full object-contain transition-transform duration-300 "
                />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="sm:hidden w-full px-6 pb-4 relative">
          {/* Previous Button */}
          <button
            onClick={handleMobilePrev}
            disabled={startIndex === 0}
            className={`absolute -left-5 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-full z-10 transition-all touch-manipulation ${
              startIndex === 0
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-gray-800 active:scale-95"
            }`}
            aria-label="Previous certificate"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Next Button */}
          <button
            onClick={handleMobileNext}
            disabled={startIndex >= certificates.length - mobileItemsToShow}
            className={`absolute -right-5 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-full z-10 transition-all touch-manipulation ${
              startIndex >= certificates.length - mobileItemsToShow
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-gray-800 active:scale-95"
            }`}
            aria-label="Next certificate"
          >
            <ChevronRight size={20} />
          </button>

          {/* Certificates Carousel */}
          <div
            className="flex gap-4 px-4 overflow-hidden"
            key={`carousel-${startIndex}`}
          >
            {visibleMobileCerts.map((cert, idx) => (
              <div
                key={`${startIndex}-${idx}`}
                className={`flex flex-col items-center group cursor-pointer shrink-0 w-full transition-all duration-500 ${
                  isAnimating
                    ? slideDirection === "right"
                      ? "opacity-100 translate-x-0 animate-slideInRight"
                      : "opacity-100 translate-x-0 animate-slideInLeft"
                    : "opacity-100 translate-x-0"
                } ${
                  isVisible && !isAnimating
                    ? "opacity-100 translate-y-0"
                    : isVisible
                    ? ""
                    : "opacity-0 translate-y-8"
                }`}
                onClick={() => setSelectedCert(cert.id)}
                style={{
                  transitionDelay: isAnimating ? `${idx * 50}ms` : "0ms",
                }}
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

          {/* Certificate Counter */}
          <div className="text-center mt-3 text-xs text-gray-600 font-medium">
            {startIndex + 1} / {certificates.length}
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
                <X size={15} className="md:size-6 text-gray-700" />
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
                  className="px-3 py-2 md:px-6 md:py-2 bg-primary-blue text-white rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-colors font-medium text-sm md:text-base"
                >
                  <span className="hidden sm:inline">← Previous</span>
                  <span className="sm:hidden">←</span>
                </button>

                <span className="text-gray-600 font-medium text-xs md:text-base">
                  {selectedCert}/{certificates.length}
                </span>

                <button
                  onClick={handleNext}
                  className="px-3 py-2 md:px-6 md:py-2 bg-primary-blue text-white rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-colors font-medium text-sm md:text-base"
                >
                  <span className="hidden sm:inline">Next →</span>
                  <span className="sm:hidden">→</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { createClient } from "@/lib/supabase/client";

interface Certificate {
  id: number;
  title: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
}

export default function Certificates({
  heading = "Certified Excellence",
}: {
  heading?: string;
}) {
  const supabase = createClient();
  const { ref, isVisible } = useScrollReveal({ threshold: 0.3 });
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<number | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  const [isAnimating, setIsAnimating] = useState(false);

  const itemsToShow = 5;
  const mobileItemsToShow = 1;

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from("guaranteed_quality_certificates")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    if (startIndex < certificates.length - itemsToShow) {
      setSlideDirection("right");
      setIsAnimating(true);
      setStartIndex((prev) => prev + 1);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const prevSlide = () => {
    if (startIndex > 0) {
      setSlideDirection("left");
      setIsAnimating(true);
      setStartIndex((prev) => prev - 1);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

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

  if (loading) {
    return (
      <section className="w-full py-20 bg-white flex flex-col items-center mx-auto overflow-hidden mt-2">
        <div className="container">
          <h2 className="heading mb-8 md:mb-10 lg:mb-12 px-4 text-center">
            {heading}
          </h2>
          <div className="text-center text-gray-500">Loading certificates...</div>
        </div>
      </section>
    );
  }

  if (certificates.length === 0) {
    return null;
  }

  const visibleCerts = certificates.slice(startIndex, startIndex + itemsToShow);
  const visibleMobileCerts = certificates.slice(
    startIndex,
    startIndex + mobileItemsToShow
  );

  const selectedCertData = certificates.find((c) => c.id === selectedCert);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="w-full py-20 bg-white flex flex-col items-center mx-auto overflow-hidden mt-2"
    >
      <div className="container">
        <h2 className="heading mb-8 md:mb-10 lg:mb-12 px-4 text-center">
          {heading}
        </h2>

        {/* Desktop/Tablet View */}
        <div className="hidden sm:block relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            disabled={startIndex === 0}
            className={`absolute flex items-center gap-1 -left-1 md:left-2 top-1/2 -translate-y-1/2 p-2 text-black rounded-full z-10 transition-all ${
              startIndex === 0
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-gray-800"
            }`}
            aria-label="Previous certificates"
          >
            <ChevronLeft size={24} className="absolute left-0" />
            <ChevronLeft size={24} className="absolute left-2" />
          </button>

          <button
            onClick={nextSlide}
            disabled={startIndex >= certificates.length - itemsToShow}
            className={`absolute flex items-center gap-1 -right-1 md:right-2 top-1/2 -translate-y-1/2 p-2 text-black transition-all ${
              startIndex >= certificates.length - itemsToShow
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-gray-800"
            }`}
            aria-label="Next certificates"
          >
            <ChevronRight size={24} className="absolute right-0" />
            <ChevronRight size={24} className="absolute right-2" />
          </button>

          {/* Certificate Grid */}
          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6"
            key={`grid-${startIndex}`}
          >
            {visibleCerts.map((cert, idx) => (
              <button
                key={`${startIndex}-${idx}`}
                onClick={() => setSelectedCert(cert.id)}
                className={`group flex flex-col bg-white overflow-hidden transition-all duration-300 cursor-pointer ${
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
                style={{
                  transitionDelay: isAnimating ? `${idx * 80}ms` : "0ms",
                }}
              >
                <div className="w-full aspect-square bg-white p-4 md:p-6 flex items-center justify-center relative overflow-hidden border-2 border-gray-200 rounded-lg hover:border-purple-400 hover:shadow-lg transition-all">
                  <Image
                    src={cert.image_url}
                    alt={cert.alt_text}
                    width={600}
                    height={600}
                    className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-3 md:p-4 text-center">
                  <h3 className="text-sm font-normal text-gray-900 leading-snug line-clamp-2">
                    {cert.title}
                  </h3>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="sm:hidden w-full px-6 pb-4 relative">
          {/* Previous Button */}
          <button
            onClick={handleMobilePrev}
            disabled={startIndex === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-full z-10 transition-all touch-manipulation ${
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
            className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-full z-10 transition-all touch-manipulation ${
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
            className="flex gap-4 items-center justify-center overflow-hidden"
            key={`mobile-${startIndex}`}
          >
            {visibleMobileCerts.map((cert, idx) => (
              <button
                key={`${startIndex}-${idx}`}
                onClick={() => setSelectedCert(cert.id)}
                className={`group bg-white w-full shadow-sm hover:shadow-lg overflow-hidden transition-all duration-300 cursor-pointer ${
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
                style={{
                  transitionDelay: isAnimating ? `${idx * 80}ms` : "0ms",
                }}
              >
                <div className="w-full relative aspect-square border-2 border-gray-200 rounded-lg overflow-hidden">
                  <Image
                    src={cert.image_url}
                    alt={cert.alt_text}
                    fill
                    className="w-full h-full object-contain transition-all duration-500 ease-in-out group-hover:scale-105"
                  />
                </div>
                <div className="p-3 text-center">
                  <h3 className="text-sm font-normal text-gray-900 leading-snug line-clamp-2">
                    {cert.title}
                  </h3>
                </div>
              </button>
            ))}
          </div>

          {/* Certificate Counter */}
          <div className="text-center mt-3 text-xs text-gray-600 font-medium">
            {startIndex + 1} / {certificates.length}
          </div>
        </div>

        {/* Modal */}
        {selectedCert !== null && selectedCertData && (
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
                  src={selectedCertData.image_url}
                  alt={selectedCertData.alt_text}
                  width={1200}
                  height={1600}
                  className="max-w-full max-h-[70vh] w-auto h-auto object-contain"
                  priority
                />
              </div>

              {/* Navigation and Info */}
              <div className="p-3 md:p-5 bg-white border-t border-gray-200 flex items-center justify-between flex-shrink-0">
                <button
                  onClick={() => {
                    const currentIndex = certificates.findIndex(
                      (c) => c.id === selectedCert
                    );
                    const prevIndex =
                      currentIndex === 0
                        ? certificates.length - 1
                        : currentIndex - 1;
                    setSelectedCert(certificates[prevIndex].id);
                  }}
                  className="px-3 py-2 md:px-6 md:py-2 bg-primary-blue text-white rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-colors font-medium text-sm md:text-base"
                >
                  <span className="hidden sm:inline">← Previous</span>
                  <span className="sm:hidden">←</span>
                </button>

                <span className="text-gray-600 font-medium text-xs md:text-base">
                  {certificates.findIndex((c) => c.id === selectedCert) + 1}/
                  {certificates.length}
                </span>

                <button
                  onClick={() => {
                    const currentIndex = certificates.findIndex(
                      (c) => c.id === selectedCert
                    );
                    const nextIndex =
                      currentIndex === certificates.length - 1
                        ? 0
                        : currentIndex + 1;
                    setSelectedCert(certificates[nextIndex].id);
                  }}
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

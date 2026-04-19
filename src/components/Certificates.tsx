"use client";

import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "right"
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const itemsToShow = 5;
  const mobileItemsToShow = 1;

  // Fetch certificates from CMS
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

  const handleNext = () => {
    if (selectedCert === null) return;
    const currentIndex = certificates.findIndex((c) => c.id === selectedCert);
    const nextIndex =
      currentIndex === certificates.length - 1 ? 0 : currentIndex + 1;
    setSelectedCert(certificates[nextIndex].id);
  };

  const handlePrev = () => {
    if (selectedCert === null) return;
    const currentIndex = certificates.findIndex((c) => c.id === selectedCert);
    const prevIndex = currentIndex === 0 ? certificates.length - 1 : currentIndex - 1;
    setSelectedCert(certificates[prevIndex].id);
  };

  // Desktop carousel handlers
  const handleDesktopNext = () => {
    if (startIndex < certificates.length - itemsToShow) {
      setSlideDirection("right");
      setIsAnimating(true);
      setStartIndex((prev) => prev + 1);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const handleDesktopPrev = () => {
    if (startIndex > 0) {
      setSlideDirection("left");
      setIsAnimating(true);
      setStartIndex((prev) => prev - 1);
      setTimeout(() => setIsAnimating(false), 500);
    }
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

  const visibleCerts = certificates.slice(startIndex, startIndex + itemsToShow);
  const visibleMobileCerts = certificates.slice(
    startIndex,
    startIndex + mobileItemsToShow
  );

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
    return null; // Don't show section if no certificates
  }

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

        {/* Desktop/Tablet Carousel View */}
        <div className="hidden sm:block relative px-12">
          {/* Previous Button */}
          <button
            onClick={handleDesktopPrev}
            disabled={startIndex === 0}
            className={`absolute -left-4 top-1/2 -translate-y-1/2 p-2 text-gray-600 z-10 transition-all duration-300 ${
              startIndex === 0
                ? "opacity-30 cursor-not-allowed"
                : "hover:text-black hover:bg-gray-100 rounded-full"
            }`}
            aria-label="Previous certificates"
          >
            <ChevronLeft size={28} />
          </button>

          {/* Next Button */}
          <button
            onClick={handleDesktopNext}
            disabled={startIndex >= certificates.length - itemsToShow}
            className={`absolute -right-4 top-1/2 -translate-y-1/2 p-2 text-gray-600 z-10 transition-all duration-300 ${
              startIndex >= certificates.length - itemsToShow
                ? "opacity-30 cursor-not-allowed"
                : "hover:text-black hover:bg-gray-100 rounded-full"
            }`}
            aria-label="Next certificates"
          >
            <ChevronRight size={28} />
          </button>

          {/* Certificates Grid */}
          <div className="w-full grid grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 overflow-hidden">
            {visibleCerts.map((cert) => (
              <div
                key={cert.id}
                className="flex flex-col items-center group cursor-pointer"
                onClick={() => setSelectedCert(cert.id)}
              >
                {/* Certificate Card */}
                <div className="relative w-full max-w-sm aspect-[4/6] rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-3 group-hover:shadow-2xl">
                  {/* Base background with gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-2 border-gray-200 group-hover:border-indigo-300 transition-all duration-300" />

                  {/* Image container */}
                  <div className="relative w-full h-full p-3 bg-white/80 backdrop-blur-sm">
                    <div className="absolute inset-3 bg-white rounded-lg shadow-inner overflow-hidden">
                      <Image
                        src={cert.image_url}
                        alt={cert.alt_text}
                        fill
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  {/* Shine/gloss effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />

                  {/* Bottom accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Status indicator */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-300 group-hover:bg-indigo-500 transition-colors duration-300" />
                  <span className="text-xs text-gray-500 group-hover:text-indigo-600 transition-colors duration-300 font-medium">
                    Click to view
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="sm:hidden w-full px-6 pb-4 relative">
          {/* Previous Button */}
          <button
            onClick={handleMobilePrev}
            disabled={startIndex === 0}
            className={`absolute -left-5 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-full z-10 transition-all touch-manipulation duration-300 ${
              startIndex === 0
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-gray-800 active:scale-95 shadow-lg"
            }`}
            aria-label="Previous certificate"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Next Button */}
          <button
            onClick={handleMobileNext}
            disabled={startIndex >= certificates.length - mobileItemsToShow}
            className={`absolute -right-5 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-full z-10 transition-all touch-manipulation duration-300 ${
              startIndex >= certificates.length - mobileItemsToShow
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-gray-800 active:scale-95 shadow-lg"
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
                      ? "opacity-100 translate-x-0"
                      : "opacity-100 translate-x-0"
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
                {/* Mobile Certificate Card */}
                <div className="w-56 aspect-[3/4] rounded-xl overflow-hidden transition-all duration-300 active:scale-95 active:shadow-lg shadow-md">
                  {/* Base background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-2 border-gray-200 active:border-indigo-400 transition-all duration-300" />

                  {/* Image container */}
                  <div className="relative w-full h-full p-3 bg-white/80 backdrop-blur-sm">
                    <div className="absolute inset-3 bg-white rounded-lg shadow-inner overflow-hidden">
                      <Image
                        src={cert.image_url}
                        alt={cert.alt_text}
                        width={250}
                        height={333}
                        className="w-full h-full object-contain transition-transform duration-300"
                      />
                    </div>
                  </div>

                  {/* Mobile shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-50 pointer-events-none rounded-xl" />
                </div>

                {/* Mobile status */}
                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-600 font-medium group-active:text-indigo-600 transition-colors">
                    Tap to enlarge
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Certificate Counter */}
          <div className="text-center mt-4 text-xs text-gray-600 font-medium bg-gray-50 py-2 rounded-lg">
            {startIndex + 1} / {certificates.length}
          </div>
        </div>

        {/* Modal */}
        {selectedCert !== null && selectedCertData && (
          <div
            className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm transition-all duration-300"
            onClick={() => setSelectedCert(null)}
          >
            <div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl md:rounded-3xl shadow-2xl w-[95vw] md:w-[90vw] max-w-4xl max-h-[90vh] flex flex-col relative z-50 overflow-hidden border border-gray-100"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "clamp(280px, 95vw, 1024px)",
                height: "clamp(400px, 90vh, 90vh)",
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedCert(null)}
                className="absolute top-3 right-3 md:top-5 md:right-5 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 z-20 border border-gray-200 hover:border-gray-300"
                aria-label="Close"
              >
                <X size={18} className="md:size-6 text-gray-700" />
              </button>

              {/* Certificate Image Container */}
              <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-y-auto overflow-x-hidden pt-16 md:pt-12 text-center relative">
                {/* Background accent */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl" />
                </div>

                {/* Image */}
                <div className="relative z-10 shadow-2xl rounded-xl overflow-hidden bg-white p-4 border border-gray-200">
                  <Image
                    src={selectedCertData.image_url}
                    alt={selectedCertData.alt_text}
                    width={1200}
                    height={1600}
                    className="max-w-full max-h-[65vh] w-auto h-auto object-contain"
                    priority
                  />
                </div>
              </div>

              {/* Navigation and Info */}
              <div className="p-4 md:p-6 bg-white border-t border-gray-200 flex items-center justify-between flex-shrink-0 gap-3">
                <button
                  onClick={handlePrev}
                  className="px-3 py-2 md:px-5 md:py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 active:scale-95 transition-all duration-200 font-medium text-sm md:text-base shadow-md hover:shadow-lg"
                >
                  <span className="hidden sm:inline">← Previous</span>
                  <span className="sm:hidden">←</span>
                </button>

                <span className="text-gray-700 font-bold text-sm md:text-base bg-gray-100 px-3 py-2 rounded-lg">
                  {certificates.findIndex((c) => c.id === selectedCert) + 1}/
                  {certificates.length}
                </span>

                <button
                  onClick={handleNext}
                  className="px-3 py-2 md:px-5 md:py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 active:scale-95 transition-all duration-200 font-medium text-sm md:text-base shadow-md hover:shadow-lg"
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

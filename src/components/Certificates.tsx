"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const [startIndex, setStartIndex] = useState(0);

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
      setStartIndex((prev) => prev + 1);
    }
  };

  const prevSlide = () => {
    if (startIndex > 0) {
      setStartIndex((prev) => prev - 1);
    }
  };

  const handleMobileNext = () => {
    if (startIndex < certificates.length - mobileItemsToShow) {
      setStartIndex((prev) => prev + 1);
    }
  };

  const handleMobilePrev = () => {
    if (startIndex > 0) {
      setStartIndex((prev) => prev - 1);
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
            className={`absolute -left-6 top-1/2 -translate-y-1/2 p-2 text-black z-10 transition-all ${
              startIndex === 0
                ? "opacity-30 cursor-not-allowed"
                : "hover:opacity-70"
            }`}
            aria-label="Previous certificates"
          >
            <ChevronLeft size={32} />
          </button>

          <button
            onClick={nextSlide}
            disabled={startIndex >= certificates.length - itemsToShow}
            className={`absolute -right-6 top-1/2 -translate-y-1/2 p-2 text-black z-10 transition-all ${
              startIndex >= certificates.length - itemsToShow
                ? "opacity-30 cursor-not-allowed"
                : "hover:opacity-70"
            }`}
            aria-label="Next certificates"
          >
            <ChevronRight size={32} />
          </button>

          {/* Certificate Grid */}
          <div className="grid grid-cols-5 gap-6 px-10">
            {visibleCerts.map((cert) => (
              <div key={cert.id} className="flex flex-col items-center gap-2">
                <Image
                  src={cert.image_url}
                  alt={cert.alt_text}
                  width={400}
                  height={500}
                  className="w-full h-auto object-contain"
                />
                <p className="text-xs text-center text-gray-600 line-clamp-2">
                  {cert.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="sm:hidden w-full relative px-4">
          {/* Previous Button */}
          <button
            onClick={handleMobilePrev}
            disabled={startIndex === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 p-2 text-black z-10 transition-all ${
              startIndex === 0
                ? "opacity-30 cursor-not-allowed"
                : "hover:opacity-70"
            }`}
            aria-label="Previous certificate"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Next Button */}
          <button
            onClick={handleMobileNext}
            disabled={startIndex >= certificates.length - mobileItemsToShow}
            className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 text-black z-10 transition-all ${
              startIndex >= certificates.length - mobileItemsToShow
                ? "opacity-30 cursor-not-allowed"
                : "hover:opacity-70"
            }`}
            aria-label="Next certificate"
          >
            <ChevronRight size={24} />
          </button>

          {/* Certificates Carousel */}
          <div className="flex gap-4 px-8 overflow-hidden">
            {visibleMobileCerts.map((cert) => (
              <div key={cert.id} className="flex flex-col items-center gap-2 w-full flex-shrink-0">
                <Image
                  src={cert.image_url}
                  alt={cert.alt_text}
                  width={300}
                  height={400}
                  className="w-full h-auto object-contain"
                />
                <p className="text-xs text-center text-gray-600 line-clamp-2">
                  {cert.title}
                </p>
              </div>
            ))}
          </div>

          {/* Certificate Counter */}
          <div className="text-center mt-4 text-xs text-gray-600 font-medium">
            {startIndex + 1} / {certificates.length}
          </div>
        </div>
      </div>
    </section>
  );
}

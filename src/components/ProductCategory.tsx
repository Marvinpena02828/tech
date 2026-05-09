"use client";

import { ChevronRight, ChevronLeft } from "lucide-react";
import AppImage from "@/components/ui/AppImage";
import { useState, useRef, useEffect } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { getPublicCategories } from "@/app/(private)/admin/categories/models/categories-model";
import type { Category } from "@/lib/types";
import Link from "next/link";

interface ProductCategoryProps {
  showDesktopNavigation?: boolean;
}

// Helper function to construct Supabase Storage URL
function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return "/Images/categories/placeholder.png";
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-images/${imagePath}`;
}

export default function ProductCategory({
  showDesktopNavigation = false,
}: ProductCategoryProps) {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.3 });
  const [startIndex, setStartIndex] = useState(0);
  const [desktopStartIndex, setDesktopStartIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "right",
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDesktopAnimating, setIsDesktopAnimating] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [desktopItemsToShow, setDesktopItemsToShow] = useState(5);
  const [containerWidth, setContainerWidth] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mobileItemsToShow = 1;

  // Determine items to show based on viewport width
  useEffect(() => {
    const updateItemsToShow = () => {
      if (typeof window === "undefined") return;

      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);

        // Responsive breakpoints for desktop
        if (width < 1024) {
          // 1024px = lg breakpoint, small laptops
          setDesktopItemsToShow(3);
        } else if (width < 1280) {
          // 1280px = xl breakpoint, medium laptops
          setDesktopItemsToShow(4);
        } else {
          // Large screens
          setDesktopItemsToShow(5);
        }
      }
    };

    updateItemsToShow();

    // Listen to window resize
    window.addEventListener("resize", updateItemsToShow);
    return () => window.removeEventListener("resize", updateItemsToShow);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchCategoriesData = await getPublicCategories();
        // Filter categories that have image_link
        if (fetchCategoriesData.success) {
          const categoriesWithImages = fetchCategoriesData.data.filter(
            (cat) => cat.is_highlighted,
          );
          setCategories(categoriesWithImages);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleMobileNext = () => {
    if (startIndex < categories.length - mobileItemsToShow) {
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

  const handleDesktopNext = () => {
    if (desktopStartIndex < categories.length - desktopItemsToShow) {
      setSlideDirection("right");
      setIsDesktopAnimating(true);
      setDesktopStartIndex((prev) => prev + 1);
      setTimeout(() => setIsDesktopAnimating(false), 500);
    }
  };

  const handleDesktopPrev = () => {
    if (desktopStartIndex > 0) {
      setSlideDirection("left");
      setIsDesktopAnimating(true);
      setDesktopStartIndex((prev) => prev - 1);
      setTimeout(() => setIsDesktopAnimating(false), 500);
    }
  };

  const handleDesktopGoToPage = (pageIndex: number) => {
    const newStartIndex = pageIndex * desktopItemsToShow;
    if (
      newStartIndex !== desktopStartIndex &&
      newStartIndex >= 0 &&
      newStartIndex < categories.length
    ) {
      setSlideDirection(newStartIndex > desktopStartIndex ? "right" : "left");
      setIsDesktopAnimating(true);
      setDesktopStartIndex(newStartIndex);
      setTimeout(() => setIsDesktopAnimating(false), 500);
    }
  };

  const visibleMobileCategories = categories.slice(
    startIndex,
    startIndex + mobileItemsToShow,
  );

  const visibleDesktopCategories = showDesktopNavigation
    ? categories.slice(
        desktopStartIndex,
        desktopStartIndex + desktopItemsToShow,
      )
    : categories;

  if (loading) {
    return (
      <section className="w-full py-20 bg-white flex flex-col items-center overflow-hidden mt-2">
        <h2 className="heading px-4 text-center">Product Category</h2>
        <div className="text-gray-500 mt-8">Loading categories...</div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="w-full py-20 bg-white flex flex-col items-center overflow-hidden mt-2"
    >
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 mb-12">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-12">
          Explore by Category
        </h2>

        {/* Desktop View - Responsive Grid */}
        <div className="hidden lg:block w-full" ref={containerRef}>
          <div className="flex items-center justify-between gap-4 lg:gap-6 xl:gap-8 w-full">
            {showDesktopNavigation && (
              <button
                onClick={handleDesktopPrev}
                disabled={desktopStartIndex === 0}
                className={`flex-shrink-0 text-black transition-all duration-300 ${
                  desktopStartIndex === 0
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:scale-110 active:scale-95"
                }`}
                aria-label="Previous categories"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            <div className="flex-1 overflow-hidden">
              <div
                className="flex items-center justify-center gap-4 lg:gap-6 xl:gap-8 transition-transform duration-500 ease-in-out"
                style={{
                  transform: showDesktopNavigation
                    ? `translateX(-${
                        desktopStartIndex * (100 / desktopItemsToShow)
                      }%)`
                    : "none",
                }}
              >
                {(showDesktopNavigation
                  ? categories
                  : visibleDesktopCategories
                ).map((cat, idx) => {
                  // Responsive width based on items shown - keep height fixed!
                  let containerWidth = "w-32";
                  if (desktopItemsToShow === 3) {
                    containerWidth = "w-40";
                  } else if (desktopItemsToShow === 4) {
                    containerWidth = "w-36";
                  } else if (desktopItemsToShow === 5) {
                    containerWidth = "w-32";
                  }

                  return (
                    <Link
                      href={`/products?category=${cat.id}`}
                      key={idx}
                      className="flex flex-col items-center group cursor-pointer flex-shrink-0 transition-all duration-300"
                      style={{
                        width: `${100 / desktopItemsToShow}%`,
                        minWidth: `${100 / desktopItemsToShow}%`,
                      }}
                    >
                      {/* Responsive oval container - width adjusts, height fixed */}
                      <div
                        className={`${containerWidth} h-80 xl:h-96 bg-gradient-to-br from-[#E5E9EC] to-[#D5DDE2] rounded-full mb-6 flex items-center justify-center relative overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group-hover:bg-white`}
                      >
                        <AppImage
                          src={getImageUrl(cat.image_link)}
                          alt={cat.title}
                          fill
                          className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />
                      </div>
                      <h3 className="text-sm lg:text-base font-semibold text-gray-900 text-center font-display tracking-tight px-2 line-clamp-2">
                        {cat.title}
                      </h3>
                    </Link>
                  );
                })}
              </div>
            </div>

            {showDesktopNavigation && (
              <button
                onClick={handleDesktopNext}
                disabled={
                  desktopStartIndex >= categories.length - desktopItemsToShow
                }
                className={`flex-shrink-0 text-black transition-all duration-300 ${
                  desktopStartIndex >= categories.length - desktopItemsToShow
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:scale-110 active:scale-95"
                }`}
                aria-label="Next categories"
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>

          {/* Pagination Controls */}
          {showDesktopNavigation && (
            <div className="text-center mt-8 text-sm text-gray-600 font-medium flex items-center gap-4 justify-center flex-wrap">
              <button
                onClick={handleDesktopPrev}
                className="text-primary-blue hover:underline transition-colors active:opacity-75"
              >
                Prev
              </button>

              {Array.from(
                { length: Math.ceil(categories.length / desktopItemsToShow) },
                (_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDesktopGoToPage(index)}
                    className={`px-2.5 py-1 rounded transition-colors text-sm ${
                      index === Math.floor(desktopStartIndex / desktopItemsToShow)
                        ? "text-primary-blue font-semibold bg-blue-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {index + 1}
                  </button>
                ),
              )}

              <button
                onClick={handleDesktopNext}
                className="text-primary-blue hover:underline transition-colors active:opacity-75"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Mobile/Tablet Horizontal Scroll */}
        <div className="lg:hidden w-full px-4 pb-4 relative">
          {/* Previous Button */}
          <button
            onClick={handleMobilePrev}
            disabled={startIndex === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-full z-10 transition-all touch-manipulation ${
              startIndex === 0
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-gray-800 active:scale-95"
            }`}
            aria-label="Previous category"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Next Button */}
          <button
            onClick={handleMobileNext}
            disabled={startIndex >= categories.length - mobileItemsToShow}
            className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-full z-10 transition-all touch-manipulation ${
              startIndex >= categories.length - mobileItemsToShow
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-gray-800 active:scale-95"
            }`}
            aria-label="Next category"
          >
            <ChevronRight size={20} />
          </button>

          {/* Categories Carousel */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 px-12 overflow-hidden"
            key={`carousel-${startIndex}`}
          >
            {visibleMobileCategories.map((cat, idx) => (
              <Link
                href={`/products?category=${cat.id}`}
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
                style={{ transitionDelay: isAnimating ? `${idx * 50}ms` : "0ms" }}
              >
                {/* Mobile image display */}
                <div className="w-40 sm:w-48 h-96 bg-gradient-to-br from-[#E5E9EC] to-[#D5DDE2] rounded-full mb-6 flex items-center justify-center relative overflow-hidden shadow-md active:shadow-lg transition-all duration-300 group-hover:bg-white">
                  <AppImage
                    src={getImageUrl(cat.image_link)}
                    alt={cat.title}
                    fill
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 text-center font-display tracking-tight px-2 line-clamp-2">
                  {cat.title}
                </h3>
              </Link>
            ))}
          </div>

          {/* Category Counter */}
          <div className="text-center mt-4 text-xs text-gray-600 font-medium">
            {startIndex + 1} / {categories.length}
          </div>
        </div>
      </div>
    </section>
  );
}

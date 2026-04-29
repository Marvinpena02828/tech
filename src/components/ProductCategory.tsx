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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mobileItemsToShow = 1;
  const desktopItemsToShow = 5;

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
      <h2 className="heading px-4 text-center">Explore by Category</h2>

      {/* Desktop View */}
      <div className="hidden container lg:block w-full relative mt-12">
        {showDesktopNavigation && (
          <>
            {/* Previous Button */}
            <button
              onClick={handleDesktopPrev}
              disabled={desktopStartIndex === 0}
              className={`absolute left-0 top-1/2 -translate-y-1/2 text-black z-10 transition-all ${
                desktopStartIndex === 0
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-gray-800 hover:scale-110"
              }`}
              aria-label="Previous categories"
            >
              <ChevronLeft size={24} className="absolute left-0" />
              <ChevronLeft size={24} className="absolute left-2" />
            </button>

            {/* Next Button */}
            <button
              onClick={handleDesktopNext}
              disabled={
                desktopStartIndex >= categories.length - desktopItemsToShow
              }
              className={`absolute right-0 top-1/2 -translate-y-1/2 text-black z-10 transition-all ${
                desktopStartIndex >= categories.length - desktopItemsToShow
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-gray-800 hover:scale-110"
              }`}
              aria-label="Next categories"
            >
              <ChevronRight size={24} className="absolute right-0" />
              <ChevronRight size={24} className="absolute right-2" />
            </button>
          </>
        )}

        <div className="overflow-hidden">
          <div
            className={`flex items-start justify-center gap-4 xl:gap-6 transition-transform duration-500 ease-in-out px-4`}
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
              return (
                <Link
                  href={`/products?category=${cat.id}`}
                  key={idx}
                  className="flex flex-col items-center group cursor-pointer flex-shrink-0"
                  style={{
                    minWidth: `${100 / desktopItemsToShow}%`,
                  }}
                >
                  {/* Properly sized oval for category display */}
                  <div className="w-48 h-[28rem] xl:w-64 xl:h-[36rem] bg-[#E5E9EC] hover:bg-white rounded-full mb-6 flex items-center justify-center relative overflow-hidden hover:shadow-lg transition-all duration-300">
                    <AppImage
                      src={getImageUrl(cat.image_link)}
                      alt={cat.title}
                      fill
                      className={`object-contain p-0 transition-transform duration-500`}
                      unoptimized
                    />
                  </div>
                  <h3 className="text-base xl:text-lg font-semibold text-gray-900 text-center font-display tracking-tight">
                    {cat.title}
                  </h3>
                </Link>
              );
            })}
          </div>
        </div>

        {showDesktopNavigation && (
          <div className="text-center mt-4 text-sm text-gray-600 font-medium flex items-center gap-6 justify-center">
            <span
              onClick={handleDesktopPrev}
              className="text-primary-blue cursor-pointer"
            >
              Prev
            </span>

            {Array.from(
              { length: Math.ceil(categories.length / desktopItemsToShow) },
              (_, index) => (
                <span
                  key={index}
                  onClick={() => handleDesktopGoToPage(index)}
                  className={`cursor-pointer ${
                    index === desktopStartIndex / desktopItemsToShow
                      ? "text-primary-blue"
                      : "text-gray-600"
                  }`}
                >
                  {index + 1}
                </span>
              ),
            )}

            <span
              onClick={handleDesktopNext}
              className="text-primary-blue cursor-pointer"
            >
              Next
            </span>
          </div>
        )}
      </div>

      {/* Mobile/Tablet Horizontal Scroll */}
      <div className="lg:hidden w-full px-6 pb-4 relative">
        {/* Previous Button */}
        <button
          onClick={handleMobilePrev}
          disabled={startIndex === 0}
          className={`absolute left-5 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-full z-10 transition-all touch-manipulation ${
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
          className={`absolute right-5 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-full z-10 transition-all touch-manipulation ${
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
          className="flex gap-6 px-4 overflow-hidden"
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
              {/* Larger oval for mobile image display */}
              <div className="w-48 h-96 sm:w-56 sm:h-[28rem] md:w-64 md:h-[32rem] bg-[#E5E9EC] rounded-full mb-6 flex items-center justify-center relative overflow-hidden shadow-md active:shadow-lg transition-all duration-300">
                <AppImage
                  src={getImageUrl(cat.image_link)}
                  alt={cat.title}
                  fill
                  className={`object-contain p-0 transition-transform duration-500`}
                  unoptimized
                />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 text-center font-display tracking-tight">
                {cat.title}
              </h3>
            </Link>
          ))}
        </div>

        {/* Category Counter */}
        <div className="text-center mt-3 text-xs text-gray-600 font-medium">
          {startIndex + 1} / {categories.length}
        </div>
      </div>
    </section>
  );
}

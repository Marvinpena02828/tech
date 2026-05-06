"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import AppImage from "@/components/ui/AppImage";
import { useState, useEffect } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import Link from "next/link";
import { getPopularProducts } from "@/actions/popularProducts";
import { PopularProductWithDetails } from "@/types/popularProducts";

export default function PopularProductLineup() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.3 });
  const [products, setProducts] = useState<PopularProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getPopularProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching popular products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const [startIndex, setStartIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">(
    "right"
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const itemsToShow = 5;
  const mobileItemsToShow = 1;
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);

  if (loading) {
    return (
      <section className="w-full py-20 lg:mt-2 bg-white">
        <div className="container text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const nextSlide = () => {
    if (startIndex < products.length - itemsToShow) {
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

  // Mobile carousel handlers
  const handleMobileNext = () => {
    if (startIndex < products.length - mobileItemsToShow) {
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

  const visibleProducts = products.slice(startIndex, startIndex + itemsToShow);
  const visibleMobileProducts = products.slice(
    startIndex,
    startIndex + mobileItemsToShow
  );

  const handleMouseEnter = (productId: string) => {
    setHoveredProductId(productId);
  };

  const handleMouseLeave = () => {
    setHoveredProductId(null);
  };

  const getImageIndex = (productId: string, images: string[]) => {
    return hoveredProductId === productId && images.length > 1 ? 1 : 0;
  };

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="w-full py-32 lg:mt-2 bg-white "
    >
      {/* Desktop/Tablet View */}
      <div className="hidden sm:block relative container">
        {/* Navigation Arrows */}

        <button
          onClick={prevSlide}
          disabled={startIndex === 0}
          className={`absolute flex items-center gap-1 -left-1 md:left-2 top-1/2 -translate-y-1/2 p-2 text-black rounded-full z-10 transition-all ${
            startIndex === 0
              ? "opacity-30 cursor-not-allowed"
              : "hover:bg-gray-800"
          }`}
          aria-label="Previous products"
        >
          <ChevronLeft size={24} className="absolute left-0" />
          <ChevronLeft size={24} className="absolute left-2" />
        </button>

        <button
          onClick={nextSlide}
          disabled={startIndex >= products.length - itemsToShow}
          className={`absolute flex items-center gap-1 -right-1 md:right-2 top-1/2 -translate-y-1/2 p-2 text-black transition-all ${
            startIndex >= products.length - itemsToShow
              ? "opacity-30 cursor-not-allowed"
              : "hover:bg-gray-800"
          }`}
          aria-label="Next products"
        >
          <ChevronRight size={24} className="absolute right-0" />
          <ChevronRight size={24} className="absolute right-2" />
        </button>

        <div style={{ maxWidth: "1280px", margin: "0 auto", paddingLeft: "1rem", paddingRight: "1rem", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", color: "#111827" }}>
            Popular Product Lineup
          </h2>
          <div style={{ 
            width: "4rem", 
            height: "0.25rem", 
            background: "linear-gradient(to right, rgb(59, 130, 246), rgb(6, 182, 212))", 
            margin: "1rem auto 0",
            borderRadius: "9999px"
          }} />

          {/* Product Grid */}
          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mt-8"
            key={`grid-${startIndex}`}
          >
            {visibleProducts.map((product, idx) => {
              const productImages = Array.isArray(product.product?.images) ? product.product.images : [];
              const productImage = product.product?.thumbnail || productImages[0] || null;
              const currentImage = productImages.length > 0 
                ? productImages[getImageIndex(product.id, productImages)] 
                : productImage;
              
              return (
                <Link
                  href={`/products/${product.product_id}`}
                  onMouseEnter={() => handleMouseEnter(product.id)}
                  onMouseLeave={handleMouseLeave}
                  key={`${startIndex}-${idx}`}
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
                  <div className="w-full aspect-square bg-white p-1 md:p-2 flex items-center justify-center relative overflow-hidden min-h-[320px] md:min-h-[400px]">
                    {currentImage ? (
                      <AppImage
                        src={currentImage}
                        alt={product.product?.title || "Product"}
                        width={600}
                        height={600}
                        className="w-full h-full object-contain transition-all duration-500 ease-in-out scale-125"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 md:p-4 text-center">
                    <h3 className="text-sm font-normal text-gray-900 leading-snug line-clamp-3 min-h-[3rem] md:min-h-[3.5rem]">
                      {product.product?.title || "Untitled Product"}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Scroll */}
      <div className="sm:hidden w-full px-6 pb-4 relative">
        {/* Previous Button */}
        <button
          onClick={handleMobilePrev}
          disabled={startIndex === 0}
          className={`absolute left-5 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-full z-10 transition-all touch-manipulation ${
            startIndex === 0
              ? "opacity-30 cursor-not-allowed"
              : "hover:bg-gray-800 active:scale-95"
          }`}
          aria-label="Previous product"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Next Button */}
        <button
          onClick={handleMobileNext}
          disabled={startIndex >= products.length - mobileItemsToShow}
          className={`absolute right-5 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-full z-10 transition-all touch-manipulation ${
            startIndex >= products.length - mobileItemsToShow
              ? "opacity-30 cursor-not-allowed"
              : "hover:bg-gray-800 active:scale-95"
          }`}
          aria-label="Next product"
        >
          <ChevronRight size={20} />
        </button>
        <h1 className="heading text-center mb-6">Popular Product Lineup</h1>

        {/* Products Carousel */}
        <div
          className="flex gap-4 items-center justify-center overflow-hidden"
          key={`mobile-${startIndex}`}
        >
          {visibleMobileProducts.map((product, idx) => {
            const productImages = Array.isArray(product.product?.images) ? product.product.images : [];
            const productImage = product.product?.thumbnail || productImages[0] || null;
            const currentImage = productImages.length > 0 
              ? productImages[getImageIndex(product.id, productImages)] 
              : productImage;
            
            return (
              <Link
                href={`/products/${product.product_id}`}
                onMouseEnter={() => handleMouseEnter(product.id)}
                onMouseLeave={handleMouseLeave}
                key={`${startIndex}-${idx}`}
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
                <div className="w-full relative aspect-square">
                  {currentImage ? (
                    <AppImage
                      src={currentImage}
                      alt={product.product?.title || "Product"}
                      fill
                      className="w-full h-full object-contain transition-all duration-500 ease-in-out group-hover:scale-105 scale-125"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-3 md:p-4 text-center">
                  <h3 className="text-base md:text-lg font-normal text-gray-900 leading-snug line-clamp-3 min-h-[3rem] md:min-h-[3.5rem]">
                    {product.product?.title || "Untitled Product"}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Product Counter */}
        <div className="text-center mt-3 text-xs text-gray-600 font-medium">
          {startIndex + 1} / {products.length}
        </div>
      </div>

      {/* View All Button */}
      <Link
        href="/products"
        className="flex justify-center mt-6 md:mt-8 px-8 md:px-12 py-2.5 md:py-3 w-fit mx-auto rounded-full transition-all text-sm md:text-base font-medium"
        style={{
          background: "#ffffff",
          borderWidth: "2px",
          borderColor: "#232250",
          color: "#111827",
          cursor: "pointer"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#dc2626";
          e.currentTarget.style.color = "#ffffff";
          e.currentTarget.style.borderColor = "#dc2626";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#ffffff";
          e.currentTarget.style.color = "#111827";
          e.currentTarget.style.borderColor = "#232250";
        }}
      >
        View All
      </Link>
    </section>
  );
}

export function StatsSection() {
  return (
    <section className="w-full bg-white py-16 flex flex-col items-center">
      {/* Stats / Icons Bar */}
      <div className="w-full max-w-[90%] grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-gray-100 pt-10">
        {[
          { label: "10+ Years Experience", icon: "🏆" },
          { label: "100% Quality Guarantee", icon: "💎" },
          { label: "1200+ Happy Clients", icon: "👥" },
          { label: "24/7 Support", icon: "🎧" },
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center text-center"
          >
            <div className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center mb-4 text-2xl">
              {item.icon}
            </div>
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider max-w-[100px]">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

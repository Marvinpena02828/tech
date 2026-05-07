"use client";

import { useState, useCallback, memo, useEffect } from "react";
import Link from "next/link";
import AppImage from "@/components/ui/AppImage";
import type { FeaturedItem } from "@/types/megaMenu";
import { getFeaturedItems } from "@/app/(private)/admin/featured/models/featured-model";
import { getPublicCategories } from "@/app/(private)/admin/categories/models/categories-model";
import { Category } from "@/lib/types";
import { ChevronRight } from "lucide-react";

interface ProductsMegaMenuProps {
  onClose?: () => void;
}

function ProductsMegaMenu({ onClose }: ProductsMegaMenuProps = {}) {
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Load all data on mount - single consolidated effect for better performance
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        "ontouchstart" in window || navigator.maxTouchPoints > 0,
      );
    };

    async function loadAllData() {
      try {
        checkTouchDevice();

        // Load categories and featured items in parallel for faster loading
        const [cats, items] = await Promise.all([
          getPublicCategories(),
          getFeaturedItems(),
        ]);

        if (!cats.success) {
          console.error(
            "[ProductsMegaMenu] Failed to load categories:",
            cats.error,
          );
          setError(cats.error || "Failed to load categories");
          return;
        }

        if (items.success && items.data.length > 0) {
          setFeaturedItems(items.data as any);
        }

        if (cats.success && cats.data && cats.data.length > 0) {
          setCategories(cats.data as any);
          setHoveredCategory(cats.data[5]);
        } else {
          console.warn("[ProductsMegaMenu] No categories available");
          setError("No categories available");
        }
      } catch (error) {
        console.error(
          "[ProductsMegaMenu] Error loading mega menu data:",
          error,
        );
        setError("Failed to load menu data");
      } finally {
        setLoading(false);
      }
    }

    loadAllData();
  }, []);

  const handleCategoryHover = useCallback((category: Category) => {
    setHoveredCategory(category);
  }, []);

  // Handle category click - allow navigation on both mobile and desktop
  const handleCategoryClick = useCallback(
    (e: React.MouseEvent, category: Category) => {
      // Close the menu when clicking a category
      if (onClose) {
        onClose();
      }
      // On touch devices, always navigate
      if (isTouchDevice) {
        return; // Let the Link navigate naturally
      }
      // On desktop with hover, just update the preview (don't prevent navigation)
      // Users can still click to navigate
      setHoveredCategory(category);
    },
    [isTouchDevice, onClose],
  );

  // Show loading state
  if (loading) {
    return (
      <div
        className="w-full bg-white rounded-none md:rounded-xl lg:rounded-2xl border-0 md:border border-gray-200 shadow-xl md:shadow-2xl overflow-hidden"
        style={{ maxWidth: "100%", margin: "0 auto" }}
      >
        <div className="w-full mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-4 sm:py-6 lg:py-8">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#32375A] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading menu...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Show error state
  if (error || !hoveredCategory || categories.length === 0) {
    return (
      <div
        className="w-full bg-white rounded-none md:rounded-xl lg:rounded-2xl border-0 md:border border-gray-200 shadow-xl md:shadow-2xl overflow-hidden"
        style={{ maxWidth: "100%", margin: "0 auto" }}
      >
        <div className="w-full mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-4 sm:py-6 lg:py-8">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className="text-red-500 mb-2">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <p className="text-gray-700 font-semibold mb-1">
                Unable to load menu
              </p>
              <p className="text-gray-500 text-sm">
                {error || "No categories available"}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-[#32375A] text-white rounded-lg hover:bg-[#4A3A6F] transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full bg-white rounded-none md:rounded-xl lg:rounded-2xl border-0 md:border border-gray-200 shadow-xl md:shadow-2xl overflow-hidden animate-fadeIn relative"
      style={{
        maxWidth: "100%",
        margin: "0 auto",
      }}
    >
      {/* Container with full width - increased padding */}
      <div className="w-full mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-6 sm:py-8 lg:py-10">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Navigation List */}
          <div className="w-full md:w-1/5">
            <nav className="space-y-1 overflow-y-auto scrollbar-thin overflow-x-hidden">
              {categories
                .filter((cat) => cat.parent_category_id === null)
                .map((category, index) => (
                  <Link
                    key={category.title}
                    href={`/products?category=${category.id}`}
                    onMouseEnter={() => handleCategoryHover(category)}
                    onClick={(e) => handleCategoryClick(e, category)}
                    className={`block px-3 sm:px-4 py-1 sm:rounded-xl text-xs sm:text-sm font-regular transition-all duration-200 group/item ${
                      hoveredCategory.title === category.title
                        ? "bg-[#d3d3d3] text-black scale-[1.02] sm:scale-105"
                        : "text-[#32375A] hover:bg-[#d3d3d3] hover:text-black hover:translate-x-0.5 sm:hover:translate-x-1"
                    }`}
                    style={{ transitionDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate pr-2 capitalize">
                        {category.title}
                      </span>
                      <svg
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 transition-transform duration-200 ${
                          hoveredCategory.title === category.title
                            ? "translate-x-0 opacity-100"
                            : "translate-x-[-8px] opacity-0 group-hover/item:translate-x-0 group-hover/item:opacity-100"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </Link>
                ))}
            </nav>
          </div>

          {/* Right Column - Featured Section */}
          <div className="w-full md:flex-1">
            <div className="h-full flex flex-col justify-between">
              {/* Featured Items - Adjusted spacing to match reference image */}
              <div className="flex-1 mt-2 mb-4">
                {loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="p-6 rounded-xl bg-gray-100 animate-pulse aspect-square"
                      />
                    ))}
                  </div>
                ) : (
                  (() => {
                    // Filter items by current category and limit to 5
                    const categoryItems = featuredItems
                      .filter(
                        (item) =>
                          item.category.parent_category_id ===
                            hoveredCategory.id ||
                          item.category.id === hoveredCategory.id,
                      )
                      .slice(0, 5);

                    return categoryItems.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
                        {categoryItems.map((item, index) => (
                          <Link
                            key={item.id}
                            href={`/products/${item.product.id}`}
                            className="group/featured flex flex-col items-center h-full"
                            style={{ animationDelay: `${index * 100}ms` }}
                            onClick={onClose}
                          >
                            {/* Image Container */}
                            <div className="relative w-full aspect-square animate-fadeInScale">
                              {item.product.images.length > 0 ? (
                                <AppImage
                                  src={item.product.images[0]}
                                  alt={item.product.title}
                                  fill
                                  className="w-full h-full object-contain group-hover/featured:scale-105 transition-transform duration-300"
                                  unoptimized
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#32375A] to-[#4A3A6F] flex items-center justify-center group-hover/featured:scale-105 transition-transform duration-300 rounded-lg">
                                  <svg
                                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white opacity-80"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1.5}
                                      d="M5 3v4M3 5h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                            {/* Product Name Below */}
                            <h6 className="text-xs sm:text-sm lg:text-sm font-regular text-gray-900 mt-2 sm:mt-2.5 text-center line-clamp-2 group-hover/featured:text-[#32375A] transition-colors">
                              {item.product.title}
                            </h6>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 sm:p-12 text-center text-gray-500 flex items-center justify-center min-h-[240px]">
                        <div>
                          <p className="text-sm sm:text-base">
                            No featured products for {hoveredCategory.title}
                          </p>
                          <p className="text-xs sm:text-sm mt-2">
                            Add items from the admin dashboard
                          </p>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>

              {/* CTA Section - MOVED CLOSER to featured items */}
              <div className="flex flex-col sm:flex-row items-center justify-start gap-3 sm:gap-4 pt-3 sm:pt-4">
                {categories
                  .filter(
                    (cat) => cat.parent_category_id === hoveredCategory.id,
                  )
                  .slice(0, 5)
                  .map((cat, index) => (
                    <Link
                      key={index}
                      href={`/products?category=${cat.id}`}
                      className="inline-flex items-center text-left space-x-1 sm:space-x-1.5 text-[#b1b5d1] text-xs hover:text-primary-blue transition-colors duration-200 group/link"
                      onClick={onClose}
                    >
                      <span className="w-max">{cat.title}</span>
                      <ChevronRight
                        width={14}
                        height={14}
                        className="flex-shrink-0"
                      />
                    </Link>
                  ))}

                <Link
                  href={`/products?category=${hoveredCategory.id}`}
                  className="inline-flex flex-shrink-0 ml-auto items-center space-x-1.5 text-[#32375A] border border-[#32375A] rounded-full px-3 py-1.5 hover:bg-[#32375A] hover:text-white font-semibold text-xs transition-colors duration-200 group/link"
                  onClick={onClose}
                >
                  <span>View All</span>
                  <ChevronRight width={16} height={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(ProductsMegaMenu);

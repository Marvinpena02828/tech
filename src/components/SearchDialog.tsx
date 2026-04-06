"use client";
import { ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AppImage from "@/components/ui/AppImage";
import { getCategoriesForMegaMenu } from "@/actions/megaMenu";
import { Category } from "@/lib/types";
import { FeaturedItem } from "@/types/megaMenu";
import Link from "next/link";
import { getFeaturedItems } from "@/app/(private)/admin/featured/models/featured-model";
import { searchProducts } from "@/app/actions/searchProducts";
import { usePathname } from "next/navigation";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [openParentCategory, setOpenParentCategory] = useState<string | null>(
    null,
  );
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus input when dialog opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      // Disable body scroll
      document.body.style.overflow = "hidden";
    } else {
      // Re-enable body scroll
      document.body.style.overflow = "unset";
      // Clear search query when dialog closes
      setSearchQuery("");
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close dialog when route changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      // Check if click is outside the dialog content
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleVisibilityChange = () => {
      // Close dialog when user switches tabs or minimizes window
      if (document.hidden) {
        onClose();
      }
    };

    // Add a small delay before attaching the click handler
    // This prevents the click that opened the dialog from immediately closing it
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isOpen, onClose]);

  // Load all data on mount - single consolidated effect for better performance
  useEffect(() => {
    async function loadAllData() {
      try {
        // Load categories and featured items in parallel for faster loading
        const cats = await getCategoriesForMegaMenu();
        const items = await getFeaturedItems();

        if (cats) {
          setCategories(cats as any);
        }
        if (items) {
          setFeaturedItems(items.data as any);
        }
      } catch (error) {
        console.error("Error loading mega menu data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAllData();
  }, []);

  // Debounced search effect
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If search query is empty, clear results
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Set loading state
    setIsSearching(true);

    // Debounce search - wait 500ms after user stops typing
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const result = await searchProducts(searchQuery);
        if (result.success && result.data) {
          setSearchResults(result.data);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Determine which products to display
  const displayProducts = searchQuery.trim()
    ? searchResults
    : featuredItems.map((item) => ({
        id: item.product.id,
        title: item.product.title,
        images: item.product.images,
      }));

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed top-1/2 inset-0 bg-black/50 z-9998 transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="fixed top-16 lg:top-20 left-0 right-0 bottom-0 z-9999 bg-white shadow-2xl animate-slide-down h-[90vh] overflow-y-hidden"
      >
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Search Input Section */}
          <div className="relative mb-8">
            <input
              ref={inputRef}
              type="text"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-300 transition-colors"
            />
            <button
              onClick={onClose}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close search"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 lg:gap-12">
            {/* Categories Section */}
            <div className="lg:h-[70vh] lg:overflow-y-auto">
              {/* Mobile: Collapsible Categories */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="w-full flex items-center justify-between text-xl font-bold text-gray-900 mb-3 px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span>Categories</span>
                  <ChevronDown
                    size={20}
                    className={`transition-transform duration-300 ${
                      isCategoriesOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isCategoriesOpen
                      ? "max-h-[400px] opacity-100 mb-6"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="flex flex-col gap-2 px-2 overflow-y-auto max-h-[350px]">
                    {categories
                      .filter(
                        (category) => category.parent_category_id === null,
                      )
                      .map((category) => {
                        const childCategories = categories.filter(
                          (cat) => cat.parent_category_id === category.id,
                        );
                        const hasChildren = childCategories.length > 0;
                        const isOpen = openParentCategory === category.id;

                        return (
                          <div key={category.id} className="space-y-1">
                            {/* Parent Category */}
                            <div className="flex items-center justify-between">
                              <Link
                                href={`/products?category=${category.id}`}
                                className="flex-1 text-left px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-md transition-colors text-sm capitalize"
                                onClick={onClose}
                              >
                                {category.title}
                              </Link>
                              {hasChildren && (
                                <button
                                  onClick={() => {
                                    setOpenParentCategory(
                                      isOpen ? null : category.id,
                                    );
                                  }}
                                  className="p-2 hover:text-red-500 transition-colors"
                                  aria-label={`Toggle ${category.title} subcategories`}
                                >
                                  <ChevronDown
                                    size={16}
                                    className={`transition-transform duration-200 ${
                                      isOpen ? "rotate-180" : "rotate-0"
                                    }`}
                                  />
                                </button>
                              )}
                            </div>

                            {/* Child Categories Dropdown */}
                            {hasChildren && (
                              <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                  isOpen
                                    ? "max-h-[500px] opacity-100"
                                    : "max-h-0 opacity-0"
                                }`}
                              >
                                <div className="pl-6 space-y-1 border-l-2 border-gray-200 pt-1">
                                  {childCategories.map((childCategory) => (
                                    <Link
                                      key={childCategory.id}
                                      href={`/products?category=${childCategory.id}`}
                                      className="block text-gray-600 text-sm hover:text-red-500 hover:bg-gray-50 rounded-md px-3 py-2 transition-colors capitalize"
                                      onClick={onClose}
                                    >
                                      {childCategory.title}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* Desktop: Always Visible Categories */}
              <div className="hidden lg:block">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Categories
                </h3>
                <div className="flex flex-col gap-3">
                  {categories
                    .filter((category) => category.parent_category_id === null)
                    .map((category, index) => (
                      <Link
                        key={index}
                        href={`/products?category=${category.id}`}
                        className="text-left px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-md transition-colors text-[15px] capitalize"
                        onClick={onClose}
                      >
                        {category.title}
                      </Link>
                    ))}
                </div>
              </div>
            </div>

            {/* Suggested Products Section */}
            <div className="lg:h-[70vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-4 lg:mb-6">
                {searchQuery.trim() ? "Search Results" : "Suggested Products"}
              </h3>
              {isSearching ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <p className="text-gray-500 mt-4">Searching...</p>
                </div>
              ) : displayProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-6">
                  {displayProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="gap-4 p-4  rounded-lg transition-colors text-left group"
                      onClick={onClose}
                    >
                      <div className="w-full relative h-20 shrink-0 rounded-lg flex items-center justify-center overflow-hidden">
                        <AppImage
                          src={product.images?.[0]}
                          alt={product.title}
                          fill
                          className="object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <p className="text-md text-center text-gray-800 font-medium leading-snug line-clamp-3">
                        {product.title}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No products found matching &quot;{searchQuery}&quot;
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Try a different search term
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

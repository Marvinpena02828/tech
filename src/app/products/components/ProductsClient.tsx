"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CategoryFilter from "./CategoryFilter";
import ProductGrid from "./ProductGrid";
import Pagination from "./Pagination";
import { Category } from "@/lib/types";
import type { ProductListItem } from "@/features/products";

interface ProductsClientProps {
  initialProducts: ProductListItem[];
  categories: Category[];
}

const ITEMS_PER_PAGE = 16;

export default function ProductsClient({
  initialProducts,
  categories,
}: ProductsClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const activeCategory = searchParams.get("category")?.toLowerCase() ?? null;

  // Filter products based on active category
  const filteredProducts = useMemo(() => {
    if (activeCategory === null || activeCategory === "all") {
      return initialProducts;
    }

    return initialProducts.filter((product) => {
      return (
        product.category.id === activeCategory ||
        product.category.parent_category_id === activeCategory
      );
    });
  }, [activeCategory, initialProducts]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  // Reset to page 1 when category changes
  const handleCategoryChange = (categoryId: string | null) => {
    setCurrentPage(1);

    // Update URL with category parameter
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === null || categoryId === "all") {
      params.delete("category");
    } else {
      params.set("category", categoryId);
    }

    const newUrl = params.toString() ? `?${params.toString()}` : "/products";
    router.push(newUrl, { scroll: false });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewAll = () => {
    handleCategoryChange(null);
  };

  return (
    <>
      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Product Grid */}
      <main className="container py-12 bg-white">
        <ProductGrid
          products={paginatedProducts}
          loading={false}
          activeCategory={activeCategory}
          onViewAll={handleViewAll}
        />

        {/* Pagination */}
        {paginatedProducts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </main>
    </>
  );
}

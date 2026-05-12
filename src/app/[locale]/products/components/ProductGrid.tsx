"use client";

import ProductCard from "./ProductCard";
import type { ProductListItem } from "@/features/products";

interface ProductGridProps {
  products: ProductListItem[];
  loading: boolean;
  activeCategory: string | null;
  onViewAll: () => void;
}

export default function ProductGrid({
  products,
  loading,
  onViewAll,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a1a40] mx-auto mb-4"></div>
          <p className="text-gray-600" suppressHydrationWarning>
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-gray-500 mb-4" suppressHydrationWarning>
          No products found in this category
        </p>
        <button
          onClick={onViewAll}
          className="px-6 py-3 bg-[#1a1a40] text-white rounded hover:bg-[#2a2a50] transition-colors"
          suppressHydrationWarning
        >
          <span suppressHydrationWarning>View All Products</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-10 gap-x-8 lg:gap-x-16 max-w-7xl mx-auto mb-12">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          title={product.title}
          images={product.images}
          thumbnail={product.thumbnail}
        />
      ))}
    </div>
  );
}

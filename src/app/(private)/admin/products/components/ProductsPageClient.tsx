"use client";

import { useState } from "react";
import type { Category, Product } from "@/lib/types";
import { useProductActions } from "../hooks/use-product-actions";
import ProductsHeader from "./ProductsHeader";
import ProductsGrid from "./ProductsGrid";
import ProductsEmptyState from "./ProductsEmptyState";

interface ProductsPageClientProps {
  products: Product[];
  categories: Category[];
}

export default function ProductsPageClient({
  products,
  categories,
}: ProductsPageClientProps) {
  const { handleDelete, handleEdit, handleCreate, deletingId } =
    useProductActions();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");


  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      product.category?.parent_category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const hasFilters = searchTerm !== "" || selectedCategory !== "all";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <ProductsHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          onAddClick={handleCreate}
        />

        {filteredProducts.length === 0 ? (
          <ProductsEmptyState
            hasFilters={hasFilters}
            onAddClick={handleCreate}
          />
        ) : (
          <>
            <ProductsGrid
              products={filteredProducts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              deletingId={deletingId}
            />

            {/* Stats Footer */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
              <p className="text-center text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

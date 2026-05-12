"use client";

import { Plus, Package } from "lucide-react";

interface ProductsEmptyStateProps {
  hasFilters: boolean;
  onAddClick: () => void;
}

export default function ProductsEmptyState({
  hasFilters,
  onAddClick,
}: ProductsEmptyStateProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
      <Package className="mx-auto text-gray-400 mb-4" size={64} />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No products found
      </h3>
      <p className="text-gray-600 mb-6">
        {hasFilters
          ? "Try adjusting your filters"
          : "Get started by adding your first product"}
      </p>
      {!hasFilters && (
        <button
          onClick={onAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
        >
          <Plus size={20} />
          Add Your First Product
        </button>
      )}
    </div>
  );
}

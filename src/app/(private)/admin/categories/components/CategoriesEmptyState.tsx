"use client";

import { Grid, Plus } from "lucide-react";

interface CategoriesEmptyStateProps {
  onAddClick: () => void;
}

export default function CategoriesEmptyState({
  onAddClick,
}: CategoriesEmptyStateProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
      <Grid className="mx-auto text-gray-400 mb-4" size={48} />
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        No Categories Yet
      </h3>
      <p className="text-gray-600 mb-6">
        Create your first product category to get started
      </p>
      <button
        onClick={onAddClick}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus size={20} />
        Add First Category
      </button>
    </div>
  );
}

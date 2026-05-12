"use client";

import { Grid, Plus } from "lucide-react";

interface CategoriesHeaderProps {
  count: number;
  onAddClick: () => void;
}

export default function CategoriesHeader({
  count,
  onAddClick,
}: CategoriesHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Grid className="text-blue-600" size={32} />
            Product Categories
          </h1>
          <p className="text-gray-600 mt-1">
            Manage categories shown in the Products dropdown menu ({count}{" "}
            total)
          </p>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { Category } from "@/lib/types";
import { useCategoryActions } from "../hooks/use-category-actions";
import CategoriesHeader from "./CategoriesHeader";
import CategoriesGrid from "./CategoriesGrid";
import CategoriesEmptyState from "./CategoriesEmptyState";
import CategoryDialog from "./CategoryDialog";

interface CategoriesPageClientProps {
  categories: Category[];
}

export default function CategoriesPageClient({
  categories,
}: CategoriesPageClientProps) {
  const [filterParentId, setFilterParentId] = useState<string>("all");
  const [filterHighlighted, setFilterHighlighted] = useState<string>("all");

  const {
    handleAdd,
    handleEdit,
    handleSave,
    handleDelete,
    showDialog,
    setShowDialog,
    selectedCategory,
    isSaving,
  } = useCategoryActions();

  const categoriesWithDescription = categories as (Category & {
    description?: string;
  })[];

  // Get top-level categories for filter
  const topLevelCategories = categories.filter(
    (cat) => !cat.parent_category_id,
  );

  // Filter categories based on selection
  let filteredCategories =
    filterParentId === "all"
      ? categoriesWithDescription
      : filterParentId === "top-level"
        ? categoriesWithDescription.filter((cat) => !cat.parent_category_id)
        : categoriesWithDescription.filter(
            (cat) => cat.parent_category_id === filterParentId,
          );

  // Apply highlighted filter
  if (filterHighlighted === "highlighted") {
    filteredCategories = filteredCategories.filter((cat) => cat.is_highlighted);
  } else if (filterHighlighted === "not-highlighted") {
    filteredCategories = filteredCategories.filter(
      (cat) => !cat.is_highlighted,
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <CategoriesHeader count={categories.length} onAddClick={handleAdd} />

        {/* Filter Section */}
        {categories.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Category
                </label>
                <select
                  value={filterParentId}
                  onChange={(e) => setFilterParentId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">
                    All Categories ({categories.length})
                  </option>
                  <option value="top-level">
                    Top Level Only ({topLevelCategories.length})
                  </option>
                  {topLevelCategories.map((category) => {
                    const subCategoryCount = categories.filter(
                      (cat) => cat.parent_category_id === category.id,
                    ).length;
                    return (
                      <option key={category.id} value={category.id}>
                        {category.title} - Subcategories ({subCategoryCount})
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Highlighted
                </label>
                <select
                  value={filterHighlighted}
                  onChange={(e) => setFilterHighlighted(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All ({categories.length})</option>
                  <option value="highlighted">
                    Highlighted Only (
                    {categories.filter((cat) => cat.is_highlighted).length})
                  </option>
                  <option value="not-highlighted">
                    Not Highlighted (
                    {categories.filter((cat) => !cat.is_highlighted).length})
                  </option>
                </select>
              </div>
            </div>
          </div>
        )}

        {categories.length === 0 ? (
          <CategoriesEmptyState onAddClick={handleAdd} />
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Categories Found
            </h3>
            <p className="text-gray-600 mb-6">
              No categories match the selected filter
            </p>
            <button
              onClick={() => setFilterParentId("all")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Show All Categories
            </button>
          </div>
        ) : (
          <CategoriesGrid
            categories={filteredCategories}
            onEdit={handleEdit}
            onDelete={handleDelete}
            allCategories={categoriesWithDescription}
          />
        )}

        <CategoryDialog
          isOpen={showDialog}
          onClose={() => setShowDialog(false)}
          onSave={handleSave}
          selectedCategory={selectedCategory}
          isSaving={isSaving}
          categories={categories}
        />
      </div>
    </div>
  );
}

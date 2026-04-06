"use client";

import type { Category } from "@/lib/types";
import CategoryCard from "./CategoryCard";

interface CategoriesGridProps {
  categories: (Category & { description?: string })[];
  onEdit: (category: Category) => void;
  onDelete: (id: string, title: string) => void;
  allCategories?: Category[];
}

export default function CategoriesGrid({
  categories,
  onEdit,
  onDelete,
  allCategories,
}: CategoriesGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
          onEdit={onEdit}
          onDelete={onDelete}
          allCategories={allCategories || categories}
        />
      ))}
    </div>
  );
}

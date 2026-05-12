"use client";

import { Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import type { Category } from "@/lib/types";
import { convertGoogleDriveUrl } from "@/lib/supabase/products";

interface CategoryCardProps {
  category: Category & { description?: string };
  onEdit: (category: Category) => void;
  onDelete: (id: string, title: string) => void;
  allCategories: Category[];
}

export default function CategoryCard({
  category,
  onEdit,
  onDelete,
  allCategories,
}: CategoryCardProps) {
  const parentCategory = category.parent_category_id
    ? allCategories.find((cat) => cat.id === category.parent_category_id)
    : null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {category.image_icon && (
            <div className="relative w-12 h-12 shrink-0">
              <Image
                src={convertGoogleDriveUrl(category.image_icon)}
                alt={category.title}
                fill
                className="object-contain rounded"
                unoptimized
              />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">
                {category.title}
              </h3>
              {category.is_highlighted && (
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                  ⭐ Highlighted
                </span>
              )}
            </div>
            {parentCategory && (
              <p className="text-xs text-blue-600 mt-1">
                Subcategory of: {parentCategory.title}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(category)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit category"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => onDelete(category.id, category.title)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete category"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600">
        {category.description || "No description"}
      </p>
      <p className="text-xs text-gray-400 mt-3">
        URL: /products?category=
        {category.title.toLowerCase().replace(/\s+/g, "-")}
      </p>
    </div>
  );
}

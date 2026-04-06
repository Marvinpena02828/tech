"use client";

import { Edit, Trash2, Package } from "lucide-react";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  isDeleting: boolean;
}

export default function ProductCard({
  product,
  onEdit,
  onDelete,
  isDeleting,
}: ProductCardProps) {
  const imageUrl = product.images?.[0] || null;


  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div className="aspect-video bg-gray-100 relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Failed to load image:", imageUrl);
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement
                ?.querySelector(".fallback-icon")
                ?.classList.remove("hidden");
            }}
          />
        ) : null}
        <div
          className={`fallback-icon flex items-center justify-center h-full ${
            imageUrl ? "hidden" : ""
          }`}
        >
          <Package className="text-gray-300" size={64} />
        </div>
        {product.category?.title && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
            {product.category.title}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
          {product.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3">SKU: {product.sku}</p>

        {product.short_description && (
          <p className="text-sm text-gray-700 line-clamp-2 mb-4">
            {product.short_description}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product.id)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            onClick={() => onDelete(product.id, product.title)}
            disabled={isDeleting}
            className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

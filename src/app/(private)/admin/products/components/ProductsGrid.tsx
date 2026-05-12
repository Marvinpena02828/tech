"use client";

import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

interface ProductsGridProps {
  products: Product[];
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  deletingId: string | null;
}

export default function ProductsGrid({
  products,
  onEdit,
  onDelete,
  deletingId,
}: ProductsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={deletingId === product.id}
        />
      ))}
    </div>
  );
}

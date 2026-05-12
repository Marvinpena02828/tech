"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { deleteProduct } from "../models/products-model";

export function useProductActions() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    setDeletingId(id);

    startTransition(async () => {
      try {
        const result = await deleteProduct(id);

        if (result.success) {
          toast.success("Product deleted successfully");
          router.refresh();
        } else {
          toast.error(result.error || "Failed to delete product");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("An unexpected error occurred");
      } finally {
        setDeletingId(null);
      }
    });
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/products/edit/${id}`);
  };

  const handleCreate = () => {
    router.push("/admin/products/new");
  };

  return {
    handleDelete,
    handleEdit,
    handleCreate,
    isPending,
    deletingId,
  };
}

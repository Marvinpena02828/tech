"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../models/categories-model";
import type { Category } from "@/lib/types";

export function useCategoryActions() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = () => {
    setSelectedCategory(null);
    setShowDialog(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setShowDialog(true);
  };

  const handleSave = async (formData: {
    title: string;
    description: string;
    imageIcon?: File | null;
    imageLink?: File | null;
    parent_category_id: string | null;
    is_highlighted: boolean;
  }) => {
    setIsSaving(true);
    startTransition(async () => {
      try {
        let result;
        if (selectedCategory) {
          // Update existing category
          result = await updateCategory(selectedCategory.id, formData);
        } else {
          // Create new category
          result = await createCategory(formData);
        }
        if (result.success) {
          toast.success(
            `Category ${selectedCategory ? "updated" : "created"} successfully`,
          );
          setShowDialog(false);
          setSelectedCategory(null);
          router.refresh();
        } else {
          toast.error(result.error || "An error occurred");
        }
      } catch (error) {
        console.error("Error saving category:", error);
        toast.error("An unexpected error occurred");
      } finally {
        setIsSaving(false);
      }
    });
  };

  const handleDelete = async (id: string, title: string) => {
    if (
      !confirm(
        `Delete category "${title}"? This will affect the mega menu dropdown.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        const result = await deleteCategory(id);
        if (result.success) {
          toast.success("Category deleted successfully");
          router.refresh();
        } else {
          toast.error(result.error || "Failed to delete category");
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error("An unexpected error occurred");
      }
    });
  };

  return {
    handleAdd,
    handleEdit,
    handleSave,
    handleDelete,
    showDialog,
    setShowDialog,
    selectedCategory,
    isPending,
    isSaving,
  };
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  createFeaturedItemAction,
  updateFeaturedItemAction,
  deleteFeaturedItemAction,
  updateFeaturedItemOrderAction,
  toggleFeaturedItemStatusAction,
} from "../actions/featured-actions";
import { deleteFeaturedItem, FeaturedItemWithDetails } from "../models/featured-model";

export function useFeaturedItems(initialItems: FeaturedItemWithDetails[]) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<FeaturedItemWithDetails | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = () => {
    setSelectedItem(null);
    setShowDialog(true);
  };

  const handleEdit = (item: FeaturedItemWithDetails) => {
    setSelectedItem(item);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedItem(null);
  };

  const handleSave = async (
    productId: string,
    categoryId: string,
    isActive: boolean
  ) => {
    setIsSaving(true);

    try {
      if (selectedItem) {
        // Update existing item
        const result = await updateFeaturedItemAction(
          selectedItem.id,
          productId,
          categoryId,
          isActive
        );

        if (result.success) {
          toast.success("Featured item updated successfully");
          setShowDialog(false);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to update featured item");
        }
      } else {
        // Create new item
        const result = await createFeaturedItemAction(productId, categoryId);

        if (result.success) {
          toast.success("Featured item created successfully");
          setShowDialog(false);
          router.refresh();
        } else {
          toast.error(result.error || "Failed to create featured item");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async (id: string, productTitle: string) => {
    if (!confirm(`Delete featured item "${productTitle}"?`)) return;

    setIsDeleting(id);

    try {
      const result = await deleteFeaturedItemAction(id);

      if (result.success) {
        toast.success("Featured item deleted successfully");
        setItems(items.filter((i) => i.id !== id));
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete featured item");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleReorder = async (id: string, direction: "up" | "down") => {
    const currentIndex = items.findIndex((i) => i.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const item1 = items[currentIndex];
    const item2 = items[newIndex];

    try {
      // Swap orders
      await Promise.all([
        updateFeaturedItemOrderAction(item1.id, item2.order),
        updateFeaturedItemOrderAction(item2.id, item1.order),
      ]);

      toast.success("Order updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update order");
      console.error(error);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const result = await toggleFeaturedItemStatusAction(id, !currentStatus);

      if (result.success) {
        toast.success(
          `Featured item ${!currentStatus ? "activated" : "deactivated"}`
        );
        router.refresh();
      } else {
        toast.error(result.error || "Failed to toggle status");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    }
  };

  return {
    items,
    isDeleting,
    showDialog,
    selectedItem,
    isSaving,
    handleAdd,
    handleEdit,
    handleCloseDialog,
    handleSave,
    handleDelete,
    handleReorder,
    handleToggleStatus,
  };
}

"use server";

import { revalidatePath } from "next/cache";
import {
  createFeaturedItem as createItem,
  updateFeaturedItem as updateItem,
  deleteFeaturedItem as deleteItem,
  updateFeaturedItemOrder as updateOrder,
  toggleFeaturedItemStatus as toggleStatus,
} from "../models/featured-model";

export async function createFeaturedItemAction(
  productId: string,
  categoryId: string
) {
  const result = await createItem(productId, categoryId);
  if (result.success) {
    revalidatePath("/admin/featured");
  }
  return result;
}

export async function updateFeaturedItemAction(
  id: string,
  productId: string,
  categoryId: string,
  isActive: boolean
) {
  const result = await updateItem(id, productId, categoryId, isActive);
  if (result.success) {
    revalidatePath("/admin/featured");
  }
  return result;
}

export async function deleteFeaturedItemAction(id: string) {
  const result = await deleteItem(id);
  if (result.success) {
    revalidatePath("/admin/featured");
  }
  return result;
}

export async function updateFeaturedItemOrderAction(
  id: string,
  newOrder: number
) {
  const result = await updateOrder(id, newOrder);
  if (result.success) {
    revalidatePath("/admin/featured");
  }
  return result;
}

export async function toggleFeaturedItemStatusAction(
  id: string,
  isActive: boolean
) {
  const result = await toggleStatus(id, isActive);
  if (result.success) {
    revalidatePath("/admin/featured");
  }
  return result;
}

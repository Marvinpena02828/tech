"use server";

import { createClient } from "@/lib/supabase/server";
import { transformImagesToProxy } from "@/lib/utils/image-proxy";
import {
  PopularProduct,
  PopularProductWithDetails,
} from "@/types/popularProducts";
import { revalidatePath } from "next/cache";

/**
 * Helper function to safely parse images field
 */
function parseImages(images: any): string[] {
  if (!images) return [];
  if (Array.isArray(images)) return images;
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images.replace(/'/g, '"'));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Fetch all active popular products with product details ordered by display_order
 */
export async function getPopularProducts(): Promise<
  PopularProductWithDetails[]
> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("popular_products")
      .select(
        `
        id,
        product_id,
        display_order,
        is_active,
        created_at,
        updated_at,
        product:products!product_id (
          id,
          title,
          images,
          thumbnail,
          category
        )
      `,
      )
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching popular products:", error);
      return [];
    }

    return (data as any[]).map((item) => {
      const product = Array.isArray(item.product)
        ? item.product[0]
        : item.product;
      return {
        ...item,
        product: product
          ? {
              ...product,
              images: transformImagesToProxy(parseImages(product.images)),
            }
          : product,
      };
    }) as PopularProductWithDetails[];
  } catch (error) {
    console.error("Unexpected error fetching popular products:", error);
    return [];
  }
}

/**
 * Fetch all popular products (including inactive) for admin with product details
 */
export async function getAllPopularProducts(): Promise<
  PopularProductWithDetails[]
> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("popular_products")
      .select(
        `
        id,
        product_id,
        display_order,
        is_active,
        created_at,
        updated_at,
        product:products!product_id (
          id,
          title,
          images,
          thumbnail,
          category
        )
      `,
      )
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching all popular products:", error);
      return [];
    }

    return (data as any[]).map((item) => {
      const product = Array.isArray(item.product)
        ? item.product[0]
        : item.product;
      return {
        ...item,
        product: product
          ? {
              ...product,
              images: parseImages(product.images),
            }
          : product,
      };
    }) as PopularProductWithDetails[];
  } catch (error) {
    console.error("Unexpected error fetching all popular products:", error);
    return [];
  }
}

/**
 * Create a new popular product entry
 */
export async function createPopularProduct(data: {
  product_id: string;
  display_order: number;
  is_active: boolean;
}) {
  try {
    const supabase = await createClient();

    const { data: newItem, error } = await supabase
      .from("popular_products")
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error("Error creating popular product:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin/popular-products");

    return { success: true, data: newItem };
  } catch (error: any) {
    console.error("Unexpected error creating popular product:", error);
    return {
      success: false,
      error: error.message || "Failed to create popular product",
    };
  }
}

/**
 * Update an existing popular product entry
 */
export async function updatePopularProduct(
  id: string,
  data: Partial<{ display_order: number; is_active: boolean }>,
) {
  try {
    const supabase = await createClient();

    const { data: updatedItem, error } = await supabase
      .from("popular_products")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating popular product:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin/popular-products");

    return { success: true, data: updatedItem };
  } catch (error: any) {
    console.error("Unexpected error updating popular product:", error);
    return {
      success: false,
      error: error.message || "Failed to update popular product",
    };
  }
}

/**
 * Delete a popular product entry
 */
export async function deletePopularProduct(id: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("popular_products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting popular product:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/admin/popular-products");

    return { success: true };
  } catch (error: any) {
    console.error("Unexpected error deleting popular product:", error);
    return {
      success: false,
      error: error.message || "Failed to delete popular product",
    };
  }
}

/**
 * Toggle active status of a popular product
 */
export async function togglePopularProductStatus(
  id: string,
  isActive: boolean,
) {
  return updatePopularProduct(id, { is_active: isActive });
}

/**
 * Get all products for selection dropdown
 */
export async function getAvailableProducts() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select("id, title, images, thumbnail")
      .eq("is_active", true)
      .order("title", { ascending: true });

    if (error) {
      console.error("Error fetching available products:", error);
      return { success: false, error: error.message, data: [] };
    }

    const parsedData = (data || []).map((product) => ({
      ...product,
      images: parseImages(product.images),
    }));

    return { success: true, data: parsedData };
  } catch (error: any) {
    console.error("Unexpected error fetching available products:", error);
    return { success: false, error: error.message, data: [] };
  }
}

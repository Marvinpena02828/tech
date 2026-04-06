"use server";
import { createClient } from "@/lib/supabase/server";
import { transformImagesToProxy } from "@/lib/utils/image-proxy";

export interface FeaturedItem {
  id: string;
  product_id: string;
  category_id: string;
  is_active: boolean;
  order: number;
  created_at?: string;
}

export interface FeaturedItemWithDetails extends FeaturedItem {
  product?: {
    id: string;
    title: string;
    images: string[];
  };
  category?: {
    id: string;
    title: string;
  };
}

export async function getFeaturedItems() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.from("featured_items").select(
      `
        *,
        product:products(id, title, images),
        category:categories(id, title, parent_category_id)
      `
    );

    if (error) {
      console.error("Error fetching featured items:", error);
      return { success: false, error: error.message, data: [] };
    }

    // Transform product images to use proxy
    const dataWithProxy = (data || []).map((item: any) => ({
      ...item,
      product: item.product
        ? {
            ...item.product,
            images: transformImagesToProxy(item.product.images || []),
          }
        : null,
    }));

    // Serialize to plain objects to avoid Next.js serialization errors
    const serializedData = JSON.parse(JSON.stringify(dataWithProxy));

    return { success: true, data: serializedData as FeaturedItemWithDetails[] };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: "Failed to fetch featured items",
      data: [],
    };
  }
}

export async function createFeaturedItem(
  productId: string,
  categoryId: string
) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("featured_items")
      .insert([
        {
          product: productId,
          category: categoryId,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating featured item:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "Failed to create featured item" };
  }
}

export async function updateFeaturedItem(
  id: string,
  productId: string,
  categoryId: string,
  isActive: boolean
) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("featured_items")
      .update({
        product: productId,
        category: categoryId,
        is_active: isActive,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating featured item:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "Failed to update featured item" };
  }
}

export async function deleteFeaturedItem(id: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("featured_items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting featured item:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "Failed to delete featured item" };
  }
}

export async function updateFeaturedItemOrder(id: string, newOrder: number) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("featured_items")
      .update({ order: newOrder })
      .eq("id", id);

    if (error) {
      console.error("Error updating order:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "Failed to update order" };
  }
}

export async function toggleFeaturedItemStatus(id: string, isActive: boolean) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("featured_items")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) {
      console.error("Error toggling status:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "Failed to toggle status" };
  }
}

"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

interface SearchProduct {
  id: string;
  title: string;
  images: string[];
  thumbnail?: string[] | null;
  category: {
    id: string;
    title: string;
  }[];
}

export async function searchProducts(
  query: string
): Promise<ActionResult<SearchProduct[]>> {
  try {
    if (!query || query.trim().length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    const supabase = await createClient();

    // Search products by title (case-insensitive)
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id,
        title,
        images,
        thumbnail,
        category:categories(id, title)
      `
      )
      .ilike("title", `%${query}%`)
      .eq("is_active", true)
      .limit(20);

    if (error) {
      console.error("Error searching products:", error);
      return {
        success: false,
        error: "Failed to search products. Please try again.",
      };
    }

    return {
      success: true,
      data: (data as SearchProduct[]) || [],
    };
  } catch (error) {
    console.error("Unexpected error during product search:", error);
    return {
      success: false,
      error: "An unexpected error occurred while searching.",
    };
  }
}

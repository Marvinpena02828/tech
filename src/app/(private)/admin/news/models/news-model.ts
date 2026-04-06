"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  newsSchema,
  newsUpdateSchema,
  type NewsInput,
  type NewsUpdateInput,
} from "@/lib/validations/news";
import type { News, ActionResult } from "@/lib/types";
import { normalizeProxyUrl } from "@/lib/utils/image-utils";

/**
 * Get all news items
 */
export async function getNews(): Promise<ActionResult<News[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching news:", error);
      return {
        success: false,
        error: "Failed to fetch news. Please try again.",
      };
    }

    // Transform image URLs to proxy URLs
    const transformedData = data.map((item) => ({
      ...item,
      image_url: normalizeProxyUrl(item.image_url),
    }));

    return {
      success: true,
      data: transformedData as News[],
    };
  } catch (error) {
    console.error("Unexpected error in getNews:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Create a new news item
 */
export async function createNews(
  input: NewsInput
): Promise<ActionResult<News>> {
  try {
    const validationResult = newsSchema.safeParse(input);
    if (!validationResult.success) {
      const errors = validationResult.error.issues
        .map((err: { message: string }) => err.message)
        .join(", ");
      return {
        success: false,
        error: `Validation failed: ${errors}`,
      };
    }

    const validatedData = validationResult.data;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Unauthorized. Please sign in to continue.",
      };
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("news")
      .insert({
        ...validatedData,
        created_at: now,
        edited_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating news:", error);
      return {
        success: false,
        error: "Failed to create news item. Please try again.",
      };
    }

    revalidatePath("/admin/news");
    revalidatePath("/news");

    return {
      success: true,
      data: data as News,
    };
  } catch (error) {
    console.error("Unexpected error in createNews:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Update an existing news item
 */
export async function updateNews(
  id: number,
  input: NewsUpdateInput
): Promise<ActionResult<News>> {
  try {
    const validationResult = newsUpdateSchema.safeParse(input);

    if (!validationResult.success) {
      const errors = validationResult.error.issues
        .map((err: { message: string }) => err.message)
        .join(", ");
      return {
        success: false,
        error: `Validation failed: ${errors}`,
      };
    }

    const validatedData = validationResult.data;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Unauthorized. Please sign in to continue.",
      };
    }

    const { data, error } = await supabase
      .from("news")
      .update({
        ...validatedData,
        edited_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating news:", error);
      return {
        success: false,
        error: "Failed to update news item. Please try again.",
      };
    }

    revalidatePath("/admin/news");
    revalidatePath("/news");

    return {
      success: true,
      data: data as News,
    };
  } catch (error) {
    console.error("Unexpected error in updateNews:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Delete a news item
 */
export async function deleteNews(id: number): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Unauthorized. Please sign in to continue.",
      };
    }

    const { error } = await supabase.from("news").delete().eq("id", id);

    if (error) {
      console.error("Error deleting news:", error);
      return {
        success: false,
        error: "Failed to delete news item. Please try again.",
      };
    }

    revalidatePath("/admin/news");
    revalidatePath("/news");

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Unexpected error in deleteNews:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function getNewsById(id: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("news")
      .select()
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching news:", error);
      return {
        success: false,
        error: "Failed to fetch news. Please try again.",
      };
    }

    // Transform image URL to proxy URL
    const transformedData = {
      ...data,
      image_url: normalizeProxyUrl(data.image_url),
    };

    return {
      success: true,
      data: transformedData,
    };
  } catch (error) {
    console.error("Unexpected error in getNewsById:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

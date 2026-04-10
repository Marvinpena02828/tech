// src/app/(private)/admin/news/models/news-model.ts

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { News, ActionResult } from "@/lib/types";

/**
 * Type definitions
 */
export interface NewsItem {
  id: number;
  caption: string;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
  edited_at: string;
}

export interface NewsInput {
  title: string;
  caption: string;
  content: string;
  image_url: string;
}

export interface NewsUpdateInput extends Partial<NewsInput> {}

/**
 * Get all news items
 */
export async function getNews(): Promise<ActionResult<NewsItem[]>> {
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

    return {
      success: true,
      data: data as NewsItem[],
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
 * Get single news item by ID
 */
export async function getNewsById(id: string): Promise<ActionResult<NewsItem>> {
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

    return {
      success: true,
      data: data as NewsItem,
    };
  } catch (error) {
    console.error("Unexpected error in getNewsById:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Create a new news item
 * Image should already be uploaded to storage before calling this
 */
export async function createNews(
  input: NewsInput
): Promise<ActionResult<NewsItem>> {
  try {
    // Validate input
    if (!input.title?.trim()) {
      return {
        success: false,
        error: "Title is required.",
      };
    }

    if (!input.caption?.trim()) {
      return {
        success: false,
        error: "Caption is required.",
      };
    }

    if (!input.content?.trim()) {
      return {
        success: false,
        error: "Content is required.",
      };
    }

    if (!input.image_url?.trim()) {
      return {
        success: false,
        error: "Image is required.",
      };
    }

    const supabase = await createClient();

    // Check authentication
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
        title: input.title.trim(),
        caption: input.caption.trim(),
        content: input.content.trim(),
        image_url: input.image_url,
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
      data: data as NewsItem,
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
 * If updating image, it should already be uploaded to storage
 */
export async function updateNews(
  id: number,
  input: NewsUpdateInput
): Promise<ActionResult<NewsItem>> {
  try {
    const supabase = await createClient();

    // Check authentication
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

    // Build update object - only include provided fields
    const updateData: Partial<NewsItem> = {
      edited_at: new Date().toISOString(),
    };

    if (input.title?.trim()) updateData.title = input.title.trim();
    if (input.caption?.trim()) updateData.caption = input.caption.trim();
    if (input.content?.trim()) updateData.content = input.content.trim();
    if (input.image_url?.trim()) updateData.image_url = input.image_url;

    const { data, error } = await supabase
      .from("news")
      .update(updateData)
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
      data: data as NewsItem,
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
 * Delete a news item and its associated image
 */
export async function deleteNews(id: number): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // Check authentication
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

    // Get the news item to find the image file
    const { data: newsItem, error: fetchError } = await supabase
      .from("news")
      .select("image_url")
      .eq("id", id)
      .single();

    // Try to delete the image from storage
    if (!fetchError && newsItem?.image_url) {
      try {
        // Extract file path from public URL
        // URL format: https://project.supabase.co/storage/v1/object/public/news-images/news/filename.jpg
        const urlParts = newsItem.image_url.split("/");
        const filePath = urlParts.slice(-2).join("/"); // Get "news/filename.jpg"

        await supabase.storage
          .from("news-images")
          .remove([filePath]);
      } catch (storageError) {
        console.warn("Failed to delete image from storage:", storageError);
        // Continue with news deletion even if image deletion fails
      }
    }

    // Delete the news record
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

/**
 * Upload image to Supabase storage
 * Returns public URL of uploaded image
 */
export async function uploadNewsImage(file: File): Promise<ActionResult<string>> {
  try {
    const supabase = await createClient();

    // Check authentication
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

    // Validate file
    if (!file.type.startsWith("image/")) {
      return {
        success: false,
        error: "File must be an image.",
      };
    }

    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: "Image must be smaller than 5MB.",
      };
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `news/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("news-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      return {
        success: false,
        error: "Failed to upload image. Please try again.",
      };
    }

    // Get public URL
    const { data } = supabase.storage
      .from("news-images")
      .getPublicUrl(filePath);

    return {
      success: true,
      data: data.publicUrl,
    };
  } catch (error) {
    console.error("Unexpected error in uploadNewsImage:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

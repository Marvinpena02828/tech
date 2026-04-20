"use server";

// src/app/(private)/admin/news/models/news-banner-model.ts

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

/**
 * Type definitions
 */
export interface NewsBannerItem {
  id: string;
  image_url: string;
  subtitle: string;
  main_text: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface NewsBannerInput {
  image_url: string;
  subtitle: string;
  main_text: string;
  title: string;
}

export interface NewsBannerUpdateInput extends Partial<NewsBannerInput> {}

/**
 * Get current news banner
 */
export async function getNewsBanner(): Promise<ActionResult<NewsBannerItem>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("news_banners")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // No banner exists yet - return default
      if (error.code === "PGRST116") {
        return {
          success: true,
          data: {
            id: "",
            image_url: "/news/banner.jpg",
            subtitle: "Empowered by",
            main_text: "INNOVATIONS",
            title: "News",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };
      }

      console.error("Error fetching banner:", error);
      return {
        success: false,
        error: "Failed to fetch banner. Please try again.",
      };
    }

    return {
      success: true,
      data: data as NewsBannerItem,
    };
  } catch (error) {
    console.error("Unexpected error in getNewsBanner:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Create or update news banner (upsert pattern - only one banner)
 * Image should already be uploaded to storage before calling this
 */
export async function updateNewsBanner(
  input: NewsBannerInput
): Promise<ActionResult<NewsBannerItem>> {
  try {
    // Validate input
    if (!input.subtitle?.trim()) {
      return {
        success: false,
        error: "Subtitle is required.",
      };
    }

    if (!input.main_text?.trim()) {
      return {
        success: false,
        error: "Main text is required.",
      };
    }

    if (!input.title?.trim()) {
      return {
        success: false,
        error: "Title is required.",
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

    // Get existing banner
    const { data: existing } = await supabase
      .from("news_banners")
      .select("id")
      .limit(1)
      .single();

    const now = new Date().toISOString();

    if (existing) {
      // Update existing banner
      const { data, error } = await supabase
        .from("news_banners")
        .update({
          image_url: input.image_url,
          subtitle: input.subtitle.trim(),
          main_text: input.main_text.trim(),
          title: input.title.trim(),
          updated_at: now,
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating banner:", error);
        return {
          success: false,
          error: "Failed to update banner. Please try again.",
        };
      }

      revalidatePath("/admin/news");
      revalidatePath("/news");

      return {
        success: true,
        data: data as NewsBannerItem,
      };
    } else {
      // Create new banner
      const { data, error } = await supabase
        .from("news_banners")
        .insert({
          image_url: input.image_url,
          subtitle: input.subtitle.trim(),
          main_text: input.main_text.trim(),
          title: input.title.trim(),
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating banner:", error);
        return {
          success: false,
          error: "Failed to create banner. Please try again.",
        };
      }

      revalidatePath("/admin/news");
      revalidatePath("/news");

      return {
        success: true,
        data: data as NewsBannerItem,
      };
    }
  } catch (error) {
    console.error("Unexpected error in updateNewsBanner:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Delete banner and its image
 */
export async function deleteNewsBanner(): Promise<ActionResult> {
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

    // Get the banner to find the image file
    const { data: banner, error: fetchError } = await supabase
      .from("news_banners")
      .select("image_url")
      .limit(1)
      .single();

    // Try to delete the image from storage
    if (!fetchError && banner?.image_url && !banner.image_url.includes("/news/banner.jpg")) {
      try {
        // Extract file path from public URL
        // URL format: https://project.supabase.co/storage/v1/object/public/news-images/banner/filename.jpg
        const urlParts = banner.image_url.split("/");
        const filePath = urlParts.slice(-2).join("/"); // Get "banner/filename.jpg"

        await supabase.storage
          .from("news-images")
          .remove([filePath]);
      } catch (storageError) {
        console.warn("Failed to delete image from storage:", storageError);
        // Continue with banner deletion even if image deletion fails
      }
    }

    // Delete the banner record
    const { error } = await supabase.from("news_banners").delete().neq("id", "");

    if (error) {
      console.error("Error deleting banner:", error);
      return {
        success: false,
        error: "Failed to delete banner. Please try again.",
      };
    }

    revalidatePath("/admin/news");
    revalidatePath("/news");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Unexpected error in deleteNewsBanner:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Upload banner image to Supabase storage
 * Returns public URL of uploaded image
 * Reuses same bucket as news images (news-images)
 */
export async function uploadNewsBannerImage(file: File): Promise<ActionResult<string>> {
  try {
    console.log("🔵 Starting banner image upload:", { fileName: file.name, fileSize: file.size });

    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("🔵 Auth check:", { userId: user?.id, authError: authError?.message });

    if (authError || !user) {
      return {
        success: false,
        error: "Unauthorized. Please sign in to continue.",
      };
    }

    // Validate file
    console.log("🔵 Validating file:", { type: file.type, isImage: file.type.startsWith("image/") });

    if (!file.type.startsWith("image/")) {
      return {
        success: false,
        error: "File must be an image.",
      };
    }

    if (file.size > 10 * 1024 * 1024) {
      return {
        success: false,
        error: "Image must be smaller than 10MB.",
      };
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `banner/${fileName}`;

    console.log("🔵 Uploading to path:", filePath);

    const { error: uploadError, data: uploadData } = await supabase.storage
      .from("news-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    console.log("🔵 Upload response:", { uploadError: uploadError?.message, uploadData });

    if (uploadError) {
      console.error("❌ Error uploading banner image:", uploadError);
      return {
        success: false,
        error: `Failed to upload image: ${uploadError.message || "Unknown error"}`,
      };
    }

    // Get public URL
    const { data } = supabase.storage
      .from("news-images")
      .getPublicUrl(filePath);

    console.log("✅ Banner upload successful. Public URL:", data.publicUrl);

    return {
      success: true,
      data: data.publicUrl,
    };
  } catch (error) {
    console.error("❌ Unexpected error in uploadNewsBannerImage:", error);
    return {
      success: false,
      error: `An unexpected error occurred: ${error instanceof Error ? error.message : "Unknown"}`,
    };
  }
}

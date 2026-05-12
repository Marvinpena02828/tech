"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

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

export async function updateNewsBanner(
  input: NewsBannerInput
): Promise<ActionResult<NewsBannerItem>> {
  try {
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

    const { data: existing } = await supabase
      .from("news_banners")
      .select("id")
      .limit(1)
      .single();

    const now = new Date().toISOString();

    if (existing) {
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

export async function uploadNewsBannerImage(file: File): Promise<ActionResult<string>> {
  try {
    console.log("🔵 Starting banner image upload:", { fileName: file.name, fileSize: file.size });

    const supabase = await createClient();

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

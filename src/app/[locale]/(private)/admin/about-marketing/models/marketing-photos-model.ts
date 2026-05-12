"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { convertGoogleDriveUrl } from "@/lib/supabase/products";
import { normalizeProxyUrl } from "@/lib/utils/image-utils";

export interface MarketingPhoto {
  id: number;
  image_url: string;
  title: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarketingPhotoInput {
  image_url: string;
  title: string;
  description: string;
  sort_order?: number;
  is_active?: boolean;
}

// ── READ ──────────────────────────────────────────────────────────────────────

export async function getMarketingPhotos(): Promise<{
  success: boolean;
  data: MarketingPhoto[];
  error?: string;
}> {
  try {
    const supabase = await createClient({ useCookies: false });

    const { data, error } = await supabase
      .from("about_marketing_photos")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching marketing photos:", error);
      return { success: false, data: [], error: error.message };
    }

    // Transform Drive URLs to proxy URLs for display
    const transformed = (data || []).map((item) => ({
      ...item,
      image_url: normalizeProxyUrl(item.image_url),
    }));

    return { success: true, data: transformed as MarketingPhoto[] };
  } catch (err) {
    console.error("Unexpected error:", err);
    return {
      success: false,
      data: [],
      error: "Failed to fetch marketing photos",
    };
  }
}

// ── CREATE ────────────────────────────────────────────────────────────────────

export async function createMarketingPhoto(
  input: MarketingPhotoInput,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized." };
    }

    const now = new Date().toISOString();
    const { error } = await supabase.from("about_marketing_photos").insert({
      image_url: convertGoogleDriveUrl(input.image_url.trim()),
      title: input.title.trim(),
      description: input.description.trim(),
      sort_order: input.sort_order ?? 0,
      is_active: input.is_active ?? true,
      created_at: now,
      updated_at: now,
    });

    if (error) {
      console.error("Error creating marketing photo:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/about");
    revalidatePath("/admin/about-marketing");
    return { success: true };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: "Failed to create marketing photo" };
  }
}

// ── UPDATE ────────────────────────────────────────────────────────────────────

export async function updateMarketingPhoto(
  id: number,
  input: MarketingPhotoInput,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized." };
    }

    const { error } = await supabase
      .from("about_marketing_photos")
      .update({
        image_url: convertGoogleDriveUrl(input.image_url.trim()),
        title: input.title.trim(),
        description: input.description.trim(),
        sort_order: input.sort_order ?? 0,
        is_active: input.is_active ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating marketing photo:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/about");
    revalidatePath("/admin/about-marketing");
    return { success: true };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: "Failed to update marketing photo" };
  }
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function deleteMarketingPhoto(
  id: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("about_marketing_photos")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting marketing photo:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/about");
    revalidatePath("/admin/about-marketing");
    return { success: true };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { success: false, error: "Failed to delete marketing photo" };
  }
}

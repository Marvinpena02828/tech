import { createClient } from "@/lib/supabase/client";

const BUCKET_NAME = "banners";

/**
 * Upload a banner image to Supabase Storage (Client-side version)
 * @param file - The image file to upload
 * @param type - 'mobile' or 'desktop'
 * @param bannerId - Optional banner ID for organizing files
 * @returns The public URL of the uploaded image
 */
export async function uploadBannerImageClient(
  file: File,
  type: "mobile" | "desktop",
  bannerId?: string
): Promise<string> {
  const supabase = createClient();

  // Validate file
  if (!file) {
    throw new Error("No file provided");
  }

  // Generate unique filename with timestamp
  const fileExt = file.name.split(".").pop();
  const timestamp = Date.now();
  const fileName = bannerId
    ? `${bannerId}/${type}-${timestamp}.${fileExt}`
    : `${type}-${timestamp}.${fileExt}`;

  try {
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading banner image:", error);
      throw new Error(`Failed to upload ${type} banner: ${error.message}`);
    }

    console.log("File uploaded successfully:", fileName);

    // Get public URL - bucket must be public for this to work
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

    console.log("Public URL generated:", publicUrl);
    return publicUrl;
  } catch (error: any) {
    console.error("Banner upload failed:", error);
    throw error;
  }
}

/**
 * Delete a banner image from Supabase Storage (Client-side version)
 * @param imageUrl - The public URL of the image to delete
 */
export async function deleteBannerImageClient(imageUrl: string): Promise<void> {
  if (!imageUrl) return;

  const supabase = createClient();

  try {
    // Extract file path from URL
    // URL format: https://[project].supabase.co/storage/v1/object/public/banners/[filepath]
    const urlParts = imageUrl.split(`/object/public/${BUCKET_NAME}/`);
    if (urlParts.length < 2) {
      console.warn("Invalid banner image URL format:", imageUrl);
      return;
    }

    const filePath = decodeURIComponent(urlParts[1]);
    console.log("Deleting banner image:", filePath);

    // Delete file from storage
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("Error deleting banner image:", error);
      // Don't throw error, just log it
    } else {
      console.log("Successfully deleted banner image:", filePath);
    }
  } catch (error: any) {
    console.error("Error in deleteBannerImageClient:", error);
  }
}

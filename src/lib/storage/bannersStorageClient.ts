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

  // Generate unique filename with timestamp
  const fileExt = file.name.split(".").pop();
  const timestamp = Date.now();
  const fileName = bannerId
    ? `${bannerId}/${type}-${timestamp}.${fileExt}`
    : `${type}-${timestamp}.${fileExt}`;

  // Upload file to Supabase Storage
  const { data, error } = await supabase.storage
    .from('banners')
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading banner image:", error);
    throw new Error(`Failed to upload ${type} banner: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('banners').getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Delete a banner image from Supabase Storage (Client-side version)
 * @param imageUrl - The public URL of the image to delete
 */
export async function deleteBannerImageClient(imageUrl: string): Promise<void> {
  if (!imageUrl) return;

  const supabase = createClient();

  // Extract file path from URL
  // URL format: https://[project].supabase.co/storage/v1/object/public/banners/[filepath]
  const urlParts = imageUrl.split(`/object/public/${BUCKET_NAME}/`);
  if (urlParts.length < 2) {
    console.warn("Invalid banner image URL format:", imageUrl);
    return;
  }

  const filePath = urlParts[1];
  console.log("Deleting banner image:", filePath);

  // Delete file from storage
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

  if (error) {
    console.error("Error deleting banner image:", error);
    // Don't throw error, just log it
  } else {
    console.log("Successfully deleted banner image:", filePath);
  }
}

import { createClient } from "@/lib/supabase/client";

const BANNERS_BUCKET = "banners";
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for videos, 10MB for images
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"];

export async function uploadBannerImageClient(
  file: File,
  type: "mobile" | "desktop" | "mobile_video" | "desktop_video",
  bannerId?: string
): Promise<string> {
  const supabase = createClient();

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size exceeds limit. Max: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    );
  }

  // Validate file type
  const isVideo = type.includes("video");
  const allowedTypes = isVideo ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;

  if (!allowedTypes.includes(file.type)) {
    const typeLabel = isVideo ? "Video" : "Image";
    throw new Error(`${typeLabel} type not supported. Type: ${file.type}`);
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split(".").pop() || (isVideo ? "mp4" : "jpg");
  const filename = `${type}-${bannerId || "new"}-${timestamp}-${randomString}.${extension}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BANNERS_BUCKET)
    .upload(filename, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Upload error:", error);
    throw new Error(`Failed to upload ${isVideo ? "video" : "image"}: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BANNERS_BUCKET)
    .getPublicUrl(filename);

  if (!urlData.publicUrl) {
    throw new Error("Failed to generate public URL");
  }

  return urlData.publicUrl;
}

// Function to delete old file when replacing
export async function deleteBannerFileClient(fileUrl: string): Promise<void> {
  if (!fileUrl) return;

  const supabase = createClient();

  // Extract filename from URL
  const urlParts = fileUrl.split("/");
  const filename = urlParts[urlParts.length - 1];

  const { error } = await supabase.storage
    .from(BANNERS_BUCKET)
    .remove([filename]);

  if (error) {
    console.warn("Failed to delete old file:", error);
    // Don't throw, just log warning
  }
}

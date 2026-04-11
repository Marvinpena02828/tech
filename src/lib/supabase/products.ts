import { createClient } from "@/lib/supabase/client";

export interface Product {
  id: string;
  title: string;
  sku: string;
  category: { title: string; id: string };
  tags: string[];
  short_description: string | null;
  images: string[];
  thumbnail: string[];
  description_images: string[];
  features: string[];
  specifications: Record<string, string>;
  colors: Array<{ name: string; hex: string }>;
  description: string | null;
  related_products: string[];
  is_active: boolean;
  video_link: string | null;
  downloads_link: string | null;
  created_at: string;
  updated_at: string;
}

// Client-side functions
// Helper function to safely parse and validate image arrays
function cleanImageArray(value: any): string[] {
  if (!value) return [];

  // If it's already an array, filter valid URLs
  if (Array.isArray(value)) {
    return value.filter(
      (url) =>
        url &&
        typeof url === "string" &&
        url.trim().length > 5 &&
        !url.startsWith("[") &&
        (url.startsWith("http://") || url.startsWith("https://"))
    );
  }

  // If it's a string that looks like an array, try to parse it
  if (typeof value === "string") {
    // Skip obvious invalid values
    if (value === "[" || value === "]" || value.length < 5) {
      return [];
    }

    // Try to parse JSON array
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return cleanImageArray(parsed);
      }
    } catch {
      // If it's a valid URL string, return it as single-item array
      if (value.startsWith("http://") || value.startsWith("https://")) {
        return [value];
      }
    }
  }

  return [];
}

export async function getProducts() {
  const supabase = createClient();
  console.log("[getProducts] Fetching all products...");

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getProducts] Error fetching products:", error);
    return [];
  }

  // Clean up invalid image data
  const cleanedData = (data || []).map((product) => ({
    ...product,
    images: cleanImageArray(product.images),
    thumbnail: cleanImageArray(product.thumbnail),
    description_images: cleanImageArray(product.description_images),
  }));

  console.log(
    "[getProducts] Successfully fetched",
    cleanedData.length,
    "products"
  );
  return cleanedData as Product[];
}

export async function getProductById(id: string) {
  const supabase = createClient();
  console.log("[getProductById] Fetching product with id:", id);

  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(title, id)")
    .eq("id", id)
    .single();

  if (error) {
    // Only log if it's not a "not found" error
    if (error.code !== "PGRST116") {
      console.error("[getProductById] Error fetching product:", error);
    } else {
      console.log("[getProductById] Product not found with id:", id);
    }
    return null;
  }

  // Clean up invalid image data
  if (data) {
    data.images = cleanImageArray(data.images);
    data.thumbnail = cleanImageArray(data.thumbnail);
    data.description_images = cleanImageArray(data.description_images);
  }

  return data as Product;
}

export async function getProductsByCategory(category: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return data as Product[];
}

export async function createProduct(
  product: Omit<Product, "created_at" | "updated_at">
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();

  if (error) {
    console.error("Error creating product:", error);
    throw error;
  }

  return data as Product;
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, "id" | "created_at" | "updated_at">>
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating product:", error);
    throw error;
  }

  return data as Product;
}

export async function deleteProduct(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    console.error("Error deleting product:", error);
    throw error;
  }

  return true;
}

// ========================================
// 🆕 SUPABASE STORAGE UPLOAD FUNCTIONS
// ========================================

/**
 * Optimize image before upload
 * - Resize if larger than max dimensions
 * - Compress to specified quality
 * - Convert to JPEG
 */
function optimizeImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, "image/jpeg", quality);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Upload product image to Supabase Storage
 * @param file - Image file to upload
 * @param type - Type of image: 'thumbnail', 'image', or 'description'
 * @returns - Public URL of the uploaded image
 */
export async function uploadProductImage(
  file: File,
  type: "thumbnail" | "image" | "description" = "image"
): Promise<string> {
  const supabase = createClient();

  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  // Validate file size (max 10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size exceeds 10MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`
    );
  }

  try {
    console.log(`[uploadProductImage] Starting upload for ${file.name}`);

    // Optimize image
    const optimizedBlob = await optimizeImage(file);

    // Generate unique filename with timestamp and random ID
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const fileExtension = "jpg"; // Always save as JPG after optimization
    const filename = `${timestamp}-${randomId}.${fileExtension}`;

    // Determine bucket path based on type
    const bucketPath = `product-${type}/${filename}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("products")
      .upload(bucketPath, optimizedBlob, {
        cacheControl: "3600", // 1 hour cache
        upsert: false,
        contentType: "image/jpeg",
      });

    if (error) {
      console.error("[uploadProductImage] Upload error:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from("products")
      .getPublicUrl(bucketPath);

    console.log(
      `[uploadProductImage] Successfully uploaded: ${publicData.publicUrl}`
    );
    return publicData.publicUrl;
  } catch (error) {
    console.error("[uploadProductImage] Error:", error);
    throw error;
  }
}

/**
 * Delete product image from Supabase Storage
 * @param imageUrl - Full URL of the image to delete
 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
  const supabase = createClient();

  try {
    console.log("[deleteProductImage] Deleting:", imageUrl);

    // Extract path from URL
    // URL format: https://xxxx.supabase.co/storage/v1/object/public/products/product-image/timestamp-id.jpg
    const urlParts = imageUrl.split("/storage/v1/object/public/products/");
    if (urlParts.length < 2) {
      console.warn("[deleteProductImage] Invalid URL format:", imageUrl);
      return;
    }

    const filePath = urlParts[1];

    // Delete from storage
    const { error } = await supabase.storage
      .from("products")
      .remove([filePath]);

    if (error) {
      console.error("[deleteProductImage] Delete error:", error);
      // Don't throw - just log the error
      // This prevents form submission from failing if deletion fails
    } else {
      console.log("[deleteProductImage] Successfully deleted:", filePath);
    }
  } catch (error) {
    console.error("[deleteProductImage] Error:", error);
    // Don't throw - just log
  }
}

/**
 * Delete multiple product images from Supabase Storage
 */
export async function deleteProductImages(imageUrls: string[]): Promise<void> {
  const supabase = createClient();

  try {
    const filePaths = imageUrls
      .map((url) => {
        const urlParts = url.split("/storage/v1/object/public/products/");
        return urlParts.length > 1 ? urlParts[1] : null;
      })
      .filter((path): path is string => path !== null);

    if (filePaths.length === 0) return;

    const { error } = await supabase.storage
      .from("products")
      .remove(filePaths);

    if (error) {
      console.error("[deleteProductImages] Delete error:", error);
    } else {
      console.log("[deleteProductImages] Deleted", filePaths.length, "files");
    }
  } catch (error) {
    console.error("[deleteProductImages] Error:", error);
  }
}

// ========================================
// LEGACY GOOGLE DRIVE FUNCTION (kept for backwards compatibility)
// ========================================

// Helper function to convert Google Drive share link to direct image URL
export function convertGoogleDriveUrl(url: string): string {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return "";
  }

  const trimmedUrl = url.trim();

  // Check if it's already a direct link (thumbnail format)
  if (
    trimmedUrl.includes("drive.google.com/thumbnail?id=") ||
    trimmedUrl.includes("lh3.googleusercontent.com")
  ) {
    return trimmedUrl;
  }

  // Extract file ID from various Google Drive URL formats
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
    /uc\?export=view&id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = trimmedUrl.match(pattern);
    if (match && match[1]) {
      // Use thumbnail endpoint which is more reliable for images
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
    }
  }

  // If it's already a valid URL (http/https), return it
  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    return trimmedUrl;
  }

  // If no match and not a URL, return empty string
  return "";
}

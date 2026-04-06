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

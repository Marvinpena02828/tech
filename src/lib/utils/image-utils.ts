/**
 * Image Utility Functions
 * Centralized utilities for image handling, URL normalization, and size optimization
 */

/**
 * Detect if an image URL is external (http/https)
 */
export function isExternalImage(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://");
}

/**
 * Normalize Google Drive proxy URL to be cache-friendly
 * Removes timestamps and ensures consistent format
 *
 * @param url - Google Drive image URL
 * @returns Normalized proxy URL
 */
export function normalizeProxyUrl(url: string): string {
  try {
    // If already a proxy URL, return as-is
    if (url.startsWith("/api/google-proxy/")) {
      return url;
    }

    // Parse the URL
    const urlObj = new URL(url);

    // Extract file ID from Google Drive URL
    const fileId = urlObj.searchParams.get("id");

    if (!fileId) {
      console.warn("Could not extract file ID from Google Drive URL:", url);
      return url;
    }

    // Get size parameter or use default
    const sizeParam = urlObj.searchParams.get("sz") || "w1000";

    // Return normalized proxy URL (cache-friendly, no timestamps)
    return `/api/google-proxy/${fileId}?sz=${sizeParam}`;
  } catch (error) {
    console.error("Error normalizing proxy URL:", error);
    return url;
  }
}

/**
 * Wrap Supabase storage URLs with the proxy endpoint to bypass regional blocks
 */
export function proxifySupabaseImage(url: string): string {
  try {
    if (!url) return url;

    if (url.startsWith("/api/google-proxy/")) {
      return url;
    }

    const parsedUrl = new URL(url);
    const isSupabaseHost = parsedUrl.hostname.includes("supabase.co");

    if (!isSupabaseHost) {
      return url;
    }

    const encoded = encodeURIComponent(url);
    return `/api/google-proxy/supabase?url=${encoded}`;
  } catch (error) {
    console.error("Error proxifying Supabase image URL:", error);
    return url;
  }
}

/**
 * Validate that external images have explicit dimensions
 */
export function validateExternalImageDimensions(
  src: string,
  width?: number | string,
  height?: number | string,
  fill?: boolean,
): { valid: boolean; error?: string } {
  // Only validate external images
  if (!isExternalImage(src)) {
    return { valid: true };
  }

  // Fill prop is allowed for external images with proper container
  if (fill) {
    return { valid: true };
  }

  // External images must have explicit dimensions
  if (!width || !height) {
    return {
      valid: false,
      error: `External image "${src}" requires explicit width and height props. Fill prop is also allowed if image is in a sized container.`,
    };
  }

  return { valid: true };
}

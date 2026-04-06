import { normalizeProxyUrl, proxifySupabaseImage } from "./image-utils";

/**
 * Transform Google Drive image URLs to use our proxy endpoint
 * This bypasses regional blocking (e.g., in China)
 * Now uses normalized URLs for better caching
 */
export function transformImageToProxy(image: string): string {
  try {
    if (!image) return image;

    // Route Supabase storage assets through the proxy as well
    const supabaseProxied = proxifySupabaseImage(image);
    if (supabaseProxied.startsWith("/api/google-proxy/")) {
      return supabaseProxied;
    }

    // Otherwise, normalize Google Drive URLs to proxy
    return normalizeProxyUrl(image);
  } catch {
    // If URL parsing fails, return original image
    return image;
  }
}

/**
 * Transform an array of Google Drive image URLs to use our proxy endpoint
 */
export function transformImagesToProxy(images: string[]): string[] {
  return images.map(transformImageToProxy);
}

import type { ComponentProps } from "react";
import AppImage from "@/components/ui/AppImage";
import { getBlurDataUrl } from "@/config/blurPlaceholders";

type AppImageProps = ComponentProps<typeof AppImage>;

interface OptimizedImageProps extends Omit<
  AppImageProps,
  "src" | "placeholder" | "blurDataURL"
> {
  src: string;
  /**
   * Whether to use AVIF format (default: true)
   * Set to false to use original images
   */
  useAvif?: boolean;
  /**
   * Whether to show blur placeholder while loading (default: true)
   */
  showBlurPlaceholder?: boolean;
}

/**
 * Optimized Image component that automatically uses AVIF format and blur placeholders
 *
 * @example
 * ```tsx
 * <OptimizedImage
 *   src="/Images/products/Car Charger/1/1.jpg"
 *   alt="Car Charger"
 *   width={500}
 *   height={500}
 * />
 * ```
 */
export default function OptimizedImage({
  src,
  useAvif = true,
  showBlurPlaceholder = true,
  alt,
  ...props
}: OptimizedImageProps) {
  // Category name mappings for path conversion
  const categoryMap: Record<string, string> = {
    "Power Bank": "powerbank",
    "Car Charger": "car-charger",
    "Wall Charger": "wall-charger",
    "Data and Charge Cables": "charger-cables",
    "WIRELESS EARPHONES & HEADPHONES": "headphones",
    "Wireless Earphones": "headphones",
  };

  // Convert path to AVIF if enabled
  let imageSrc = src;
  if (useAvif && src.includes("/Images/products/")) {
    imageSrc = src.replace("/Images/products/", "/Images/products-avif/");

    // Replace category names using the mapping
    for (const [oldName, newName] of Object.entries(categoryMap)) {
      imageSrc = imageSrc.replace(`/${oldName}/`, `/${newName}/`);
    }

    // Convert file extension to .avif
    imageSrc = imageSrc.replace(/\.(jpg|jpeg|png)$/i, ".avif");
  }

  // Get blur placeholder
  const blurDataURL = showBlurPlaceholder ? getBlurDataUrl(src) : undefined;

  return (
    <AppImage
      src={imageSrc}
      alt={alt}
      placeholder={blurDataURL ? "blur" : "empty"}
      blurDataURL={blurDataURL}
      {...props}
    />
  );
}

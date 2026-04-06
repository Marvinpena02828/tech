"use client";

import Image, { ImageProps } from "next/image";
import {
  isExternalImage,
  validateExternalImageDimensions,
} from "@/lib/utils/image-utils";

/**
 * AppImage - Smart wrapper around next/image
 *
 * Automatically handles optimization based on image source:
 * - Local images (/public): Optimized by Next.js
 * - External images (http/https): Served unoptimized to avoid Vercel transformation costs
 *
 * Key features:
 * - Auto-detects external URLs and disables optimization
 * - Enforces explicit dimensions for external images
 * - Supports all standard Next.js Image props
 * - Provides helpful errors for missing dimensions
 *
 * @example
 * // Local image (optimized)
 * <AppImage src="/logo.png" alt="Logo" width={200} height={100} />
 *
 * @example
 * // External image (unoptimized)
 * <AppImage
 *   src="https://example.com/image.jpg"
 *   alt="External"
 *   width={800}
 *   height={600}
 * />
 *
 * @example
 * // Using fill prop (works for both local and external)
 * <div className="relative w-full h-64">
 *   <AppImage src="/hero.jpg" alt="Hero" fill className="object-cover" />
 * </div>
 */
export default function AppImage(props: ImageProps) {
  const { src, width, height, fill, ...restProps } = props;

  // Convert src to string for validation
  const srcString = typeof src === "string" ? src : (src as any)?.src || "";

  // Detect if image is external
  const isExternal = isExternalImage(srcString);

  // Validate external image dimensions in development
  if (process.env.NODE_ENV === "development" && isExternal) {
    const validation = validateExternalImageDimensions(
      srcString,
      width,
      height,
      fill
    );
    if (!validation.valid) {
      console.error("AppImage validation error:", validation.error);
    }
  }

  // For external images, disable Next.js optimization
  if (isExternal) {
    return (
      <Image
        {...restProps}
        src={src}
        width={width}
        height={height}
        fill={fill}
        unoptimized={true}
      />
    );
  }

  // For local images, use standard Next.js optimization
  return (
    <Image {...restProps} src={src} width={width} height={height} fill={fill} />
  );
}

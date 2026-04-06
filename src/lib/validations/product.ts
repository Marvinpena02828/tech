import { z } from "zod";

// CMS Product Schema
export const cmsProductSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title is too long"),
  sku: z
    .string()
    .min(3, "SKU must be at least 3 characters")
    .max(100, "SKU is too long"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).default([]),
  short_description: z
    .string()
    .min(10, "Short description must be at least 10 characters")
    .max(500, "Short description is too long"),
  images: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least one image is required"),
  thumbnail: z
    .array(z.string())
    .transform((val) => val.filter((url) => url.trim()))
    .default([]),
  description_images: z
    .array(z.string())
    .transform((val) => val.filter((url) => url.trim()))
    .default([]),
  features: z.array(z.string()).default([]),
  specifications: z.record(z.string(), z.string()).default({}),
  colors: z
    .array(
      z.object({
        name: z.string().min(1, "Color name is required"),
        hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
      })
    )
    .default([]),
  description: z.string().min(20, "Description must be at least 20 characters"),
  related_products: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
  video_link: z
    .string()
    .url("Invalid YouTube URL")
    .optional()
    .or(z.literal("")),
  downloads_link: z
    .string()
    .url("Invalid Google Drive URL")
    .optional()
    .or(z.literal("")),
});

export type CMSProductFormData = z.infer<typeof cmsProductSchema>;

// Old schemas for compatibility
export const productSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(255, "Product name must be less than 255 characters")
    .trim(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters")
    .trim(),
  category_id: z
    .string()
    .uuid("Invalid category ID")
    .min(1, "Category is required"),
  tags: z
    .array(z.string().trim())
    .min(1, "At least one tag is required")
    .max(10, "Maximum 10 tags allowed"),
  image_url: z
    .string()
    .url("Invalid image URL")
    .min(1, "Image URL is required")
    .trim(),
});

export const productUpdateSchema = productSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type ProductInput = z.infer<typeof productSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

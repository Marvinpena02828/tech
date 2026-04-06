import { z } from "zod";
import { convertGoogleDriveUrl } from "@/lib/supabase/products";

export const categorySchema = z.object({
  title: z
    .string()
    .min(1, "Category title is required")
    .max(100, "Category title must be less than 100 characters")
    .trim()
    .refine((val) => val.length > 0, {
      message: "Category title cannot be empty or just whitespace",
    }),
  description: z.string().optional(),
  image_icon: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return null;
      return convertGoogleDriveUrl(val.trim());
    }),
  image_link: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return null;
      return convertGoogleDriveUrl(val.trim());
    }),
  parent_category_id: z
    .string()
    .nullable()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return null;
      return val;
    }),
  is_highlighted: z.boolean().optional().default(false),
});

export const categoryUpdateSchema = categorySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type CategoryInput = z.infer<typeof categorySchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;

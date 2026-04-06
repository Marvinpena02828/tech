import { z } from "zod";

export const newsSchema = z.object({
  title: z
    .string()
    .min(1, "News title is required")
    .max(255, "News title must be less than 255 characters")
    .trim(),
  caption: z
    .string()
    .min(10, "Summary must be at least 10 characters")
    .max(5000, "Summary must be less than 2000 characters")
    .trim(),
  content: z
    .string()
    .min(10, "Summary must be at least 10 characters")
    .max(5000, "Summary must be less than 2000 characters")
    .trim(),
  image_url: z
    .string()
    .url("Invalid image URL")
    .min(1, "Image URL is required")
    .trim(),
});

export const newsUpdateSchema = newsSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type NewsInput = z.infer<typeof newsSchema>;
export type NewsUpdateInput = z.infer<typeof newsUpdateSchema>;

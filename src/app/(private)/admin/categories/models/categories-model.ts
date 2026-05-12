"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  categorySchema,
  categoryUpdateSchema,
  type CategoryInput,
  type CategoryUpdateInput,
} from "@/lib/validations/category";
import type { Category, ActionResult } from "@/lib/types";

const STORAGE_BUCKET = "category-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Type definitions for forms with file uploads
export type CategoryInputWithFiles = Omit<CategoryInput, 'image_icon' | 'image_link'> & {
  imageIcon?: File | null;
  imageLink?: File | null;
};

export type CategoryUpdateInputWithFiles = Omit<CategoryUpdateInput, 'image_icon' | 'image_link'> & {
  imageIcon?: File | null;
  imageLink?: File | null;
};

/**
 * Upload image to Supabase Storage
 * Returns the file path (not URL)
 */
async function uploadImage(
  file: File,
  categoryId: string,
  fieldName: "icon" | "link",
): Promise<string> {
  // Validate file
  if (!file) {
    throw new Error(`${fieldName} file is required`);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`${fieldName} file size must be less than 5MB`);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      `${fieldName} file type must be JPEG, PNG, or WebP`,
    );
  }

  const supabase = await createClient();

  // Generate file path: category-images/icon-{categoryId}-{timestamp}.ext
  const timestamp = Date.now();
  const ext = file.name.split(".").pop() || "jpg";
  const filePath = `${fieldName}-${categoryId}-${timestamp}.${ext}`;

  // Convert file to buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error(`Error uploading ${fieldName}:`, error);
    throw new Error(`Failed to upload ${fieldName}. Please try again.`);
  }

  return data.path;
}

/**
 * Delete image from Supabase Storage
 */
async function deleteImage(filePath: string | null): Promise<void> {
  if (!filePath) return;

  const supabase = await createClient();

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([filePath]);

  if (error) {
    console.error("Error deleting image:", error);
    // Don't throw, just log - we don't want to fail the operation for this
  }
}

/**
 * Get all categories for public access (no authentication required)
 * Used for mega menu and public product pages
 */
export async function getPublicCategories(): Promise<ActionResult<Category[]>> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("edited_at", { ascending: true });

    if (error) {
      console.error("Error fetching public categories:", error);
      return {
        success: false,
        error: "Failed to fetch categories. Please try again.",
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Unexpected error in getPublicCategories:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Get all categories for the authenticated user (admin only)
 */
export async function getCategories(): Promise<ActionResult<Category[]>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Unauthorized. Please sign in to continue.",
      };
    }

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching categories:", error);
      return {
        success: false,
        error: "Failed to fetch categories. Please try again.",
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Unexpected error in getCategories:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Create a new category with image uploads
 */
export async function createCategory(
  input: CategoryInputWithFiles,
): Promise<ActionResult<Category>> {
  try {
    // Extract files before validation
    const { imageIcon, imageLink, ...categoryData } = input;

    // Validate input
    const validationResult = categorySchema.safeParse(categoryData);

    if (!validationResult.success) {
      const errors = validationResult.error.issues
        .map((err: { message: string }) => err.message)
        .join(", ");
      return {
        success: false,
        error: `Validation failed: ${errors}`,
      };
    }

    const validatedData = validationResult.data;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Unauthorized. Please sign in to continue.",
      };
    }

    // Check for duplicate category title
    const { data: existingCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("title", validatedData.title)
      .single();

    if (existingCategory) {
      return {
        success: false,
        error: "A category with this title already exists.",
      };
    }

    // Create category first to get ID
    const now = new Date().toISOString();
    const { data: newCategory, error: createError } = await supabase
      .from("categories")
      .insert({
        ...validatedData,
        image_icon: null,
        image_link: null,
        created_at: now,
        edited_at: now,
      })
      .select()
      .single();

    if (createError || !newCategory) {
      console.error("Error creating category:", createError);
      return {
        success: false,
        error: "Failed to create category. Please try again.",
      };
    }

    // Upload images if provided
    const updates: Record<string, any> = {};

    try {
      if (imageIcon) {
        const iconPath = await uploadImage(imageIcon, newCategory.id, "icon");
        updates.image_icon = iconPath;
      }

      if (imageLink) {
        const linkPath = await uploadImage(imageLink, newCategory.id, "link");
        updates.image_link = linkPath;
      }
    } catch (uploadError) {
      // If image upload fails, delete the category we just created
      await supabase.from("categories").delete().eq("id", newCategory.id);
      return {
        success: false,
        error:
          uploadError instanceof Error
            ? uploadError.message
            : "Failed to upload images.",
      };
    }

    // Update category with image paths if any were uploaded
    if (Object.keys(updates).length > 0) {
      const { data: updatedCategory, error: updateError } = await supabase
        .from("categories")
        .update({
          ...updates,
          edited_at: now,
        })
        .eq("id", newCategory.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating category with images:", updateError);
        return {
          success: false,
          error: "Failed to save images. Please try again.",
        };
      }

      revalidatePath("/admin/categories");
      return {
        success: true,
        data: updatedCategory as Category,
      };
    }

    revalidatePath("/admin/categories");
    return {
      success: true,
      data: newCategory as Category,
    };
  } catch (error) {
    console.error("Unexpected error in createCategory:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Update an existing category with optional image uploads
 */
export async function updateCategory(
  id: string,
  input: CategoryUpdateInputWithFiles,
): Promise<ActionResult<Category>> {
  try {
    if (!id || typeof id !== "string") {
      return {
        success: false,
        error: "Invalid category ID provided.",
      };
    }

    // Extract files before validation
    const { imageIcon, imageLink, ...categoryData } = input;

    // Validate input
    const validationResult = categoryUpdateSchema.safeParse(categoryData);

    if (!validationResult.success) {
      const errors = validationResult.error.issues
        .map((err: { message: string }) => err.message)
        .join(", ");
      return {
        success: false,
        error: `Validation failed: ${errors}`,
      };
    }

    const validatedData = validationResult.data;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Unauthorized. Please sign in to continue.",
      };
    }

    // Check if category exists
    const { data: existingCategory, error: fetchError } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingCategory) {
      return {
        success: false,
        error: "Category not found or you don't have permission to update it.",
      };
    }

    // Check for duplicate title if title is being updated
    if (validatedData.title && validatedData.title !== existingCategory.title) {
      const { data: duplicateCategory } = await supabase
        .from("categories")
        .select("id")
        .eq("title", validatedData.title)
        .neq("id", id)
        .single();

      if (duplicateCategory) {
        return {
          success: false,
          error: "A category with this title already exists.",
        };
      }
    }

    // Handle image uploads and deletions
    const updates: Record<string, any> = { ...validatedData };

    try {
      // Handle imageIcon
      if (imageIcon instanceof File) {
        // Delete old image if exists
        if (existingCategory.image_icon) {
          await deleteImage(existingCategory.image_icon);
        }
        // Upload new image
        const iconPath = await uploadImage(imageIcon, id, "icon");
        updates.image_icon = iconPath;
      } else if (imageIcon === null) {
        // Explicitly delete image
        if (existingCategory.image_icon) {
          await deleteImage(existingCategory.image_icon);
        }
        updates.image_icon = null;
      }

      // Handle imageLink
      if (imageLink instanceof File) {
        // Delete old image if exists
        if (existingCategory.image_link) {
          await deleteImage(existingCategory.image_link);
        }
        // Upload new image
        const linkPath = await uploadImage(imageLink, id, "link");
        updates.image_link = linkPath;
      } else if (imageLink === null) {
        // Explicitly delete image
        if (existingCategory.image_link) {
          await deleteImage(existingCategory.image_link);
        }
        updates.image_link = null;
      }
    } catch (uploadError) {
      return {
        success: false,
        error:
          uploadError instanceof Error
            ? uploadError.message
            : "Failed to handle images.",
      };
    }

    // Update category
    const { data, error } = await supabase
      .from("categories")
      .update({
        ...updates,
        edited_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating category:", error);
      return {
        success: false,
        error: "Failed to update category. Please try again.",
      };
    }

    revalidatePath("/admin/categories");

    return {
      success: true,
      data: data as Category,
    };
  } catch (error) {
    console.error("Unexpected error in updateCategory:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Delete a category and its images
 */
export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    if (!id || typeof id !== "string") {
      return {
        success: false,
        error: "Invalid category ID provided.",
      };
    }

    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Unauthorized. Please sign in to continue.",
      };
    }

    // Check if category exists
    const { data: existingCategory, error: fetchError } = await supabase
      .from("categories")
      .select("id, title, image_icon, image_link")
      .eq("id", id)
      .single();

    if (fetchError || !existingCategory) {
      return {
        success: false,
        error: "Category not found or you don't have permission to delete it.",
      };
    }

    // Check if any products are using this category
    const { data: productsUsingCategory, error: productCheckError } =
      await supabase
        .from("products")
        .select("id")
        .eq("category", existingCategory.id)
        .limit(1);

    if (productCheckError) {
      console.error("Error checking products:", productCheckError);
      return {
        success: false,
        error: "Failed to verify category usage. Please try again.",
      };
    }

    if (productsUsingCategory && productsUsingCategory.length > 0) {
      return {
        success: false,
        error:
          "Cannot delete category. Products are still using this category. Please reassign or delete those products first.",
      };
    }

    // Delete images from storage
    if (existingCategory.image_icon) {
      await deleteImage(existingCategory.image_icon);
    }
    if (existingCategory.image_link) {
      await deleteImage(existingCategory.image_link);
    }

    // Delete category
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      console.error("Error deleting category:", error);
      return {
        success: false,
        error: "Failed to delete category. Please try again.",
      };
    }

    revalidatePath("/admin/categories");

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Unexpected error in deleteCategory:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

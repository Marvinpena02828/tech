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
import { transformImageToProxy } from "@/lib/utils/image-proxy";

/**
 * Get all categories for public access (no authentication required)
 * Used for mega menu and public product pages
 */
export async function getPublicCategories(): Promise<ActionResult<Category[]>> {
  try {
    const supabase = await createClient();

    // Fetch categories without authentication check
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

    // Transform category images to use proxy
    const categoriesWithProxy = (data || []).map((category) => ({
      ...category,
      image_icon: category.image_icon
        ? transformImageToProxy(category.image_icon)
        : category.image_icon,
      image_link: category.image_link
        ? transformImageToProxy(category.image_link)
        : category.image_link,
    }));

    return {
      success: true,
      data: categoriesWithProxy,
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

    // Fetch categories
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

    // Transform category images to use proxy
    const categoriesWithProxy = (data || []).map((category) => ({
      ...category,
      image_icon: category.image_icon
        ? transformImageToProxy(category.image_icon)
        : category.image_icon,
      image_link: category.image_link
        ? transformImageToProxy(category.image_link)
        : category.image_link,
    }));

    return {
      success: true,
      data: categoriesWithProxy,
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
 * Create a new category
 */
export async function createCategory(
  input: CategoryInput,
): Promise<ActionResult<Category>> {
  try {
    // Validate input
    const validationResult = categorySchema.safeParse(input);

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

    // Create category
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("categories")
      .insert({
        ...validatedData,
        created_at: now,
        edited_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      return {
        success: false,
        error: "Failed to create category. Please try again.",
      };
    }

    revalidatePath("/admin/categories");

    return {
      success: true,
      data: data as Category,
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
 * Update an existing category
 */
export async function updateCategory(
  id: string,
  input: CategoryUpdateInput,
): Promise<ActionResult<Category>> {
  try {
    if (!id || typeof id !== "string") {
      return {
        success: false,
        error: "Invalid category ID provided.",
      };
    }

    // Validate input
    const validationResult = categoryUpdateSchema.safeParse(input);

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

    // Update category
    const { data, error } = await supabase
      .from("categories")
      .update({
        ...validatedData,
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
 * Delete a category
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
      .select("id, title")
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

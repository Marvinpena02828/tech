"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  productSchema,
  productUpdateSchema,
  type ProductInput,
  type ProductUpdateInput,
} from "@/lib/validations/product";
import type { Product, ActionResult } from "@/lib/types";
import { transformImagesToProxy } from "@/lib/utils/image-proxy";

/**
 * Get all products for the authenticated user
 */
export async function getProducts(): Promise<ActionResult<Product[]>> {
  try {
    const supabase = await createClient();

    // Fetch products with category information
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        category:categories(id, title, parent_category_id)
      `
      ).eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      return {
        success: false,
        error: "Failed to fetch products. Please try again.",
      };
    }

    return {
      success: true,
      data: data.map((product) => {
        try {
          return {
            ...product,
            images: transformImagesToProxy(product.images || []),
          } as Product;
        } catch (error) {
          console.error("Error transforming product images:", error);
          // Return product with original images if transformation fails
          return product as Product;
        }
      }),
    };
  } catch (error) {
    console.error("Unexpected error in getProducts:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Get a single product by ID
 */
export async function getProductById(
  id: string
): Promise<ActionResult<Product>> {
  try {
    if (!id || typeof id !== "string") {
      return {
        success: false,
        error: "Invalid product ID provided.",
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

    // Fetch product with category information
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        category:categories(id, title)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      return {
        success: false,
        error: "Product not found or you don't have permission to view it.",
      };
    }

    return {
      success: true,
      data: data as Product,
    };
  } catch (error) {
    console.error("Unexpected error in getProductById:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Create a new product
 */
export async function createProduct(
  input: ProductInput
): Promise<ActionResult<Product>> {
  try {
    // Validate input
    const validationResult = productSchema.safeParse(input);
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
    const { data: categoryExists, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("id", validatedData.category_id)
      .single();

    if (categoryError || !categoryExists) {
      return {
        success: false,
        error: "Selected category does not exist. Please create it first.",
      };
    }

    // Create product
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("products")
      .insert({
        ...validatedData,
        created_at: now,
        edited_at: now,
      })
      .select(
        `
        *,
        category:categories(id, title)
      `
      )
      .single();

    if (error) {
      console.error("Error creating product:", error);
      return {
        success: false,
        error: "Failed to create product. Please try again.",
      };
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");

    return {
      success: true,
      data: data as Product,
    };
  } catch (error) {
    console.error("Unexpected error in createProduct:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(
  id: string,
  input: ProductUpdateInput
): Promise<ActionResult<Product>> {
  try {
    if (!id || typeof id !== "string") {
      return {
        success: false,
        error: "Invalid product ID provided.",
      };
    }

    // Validate input
    const validationResult = productUpdateSchema.safeParse(input);

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

    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingProduct) {
      return {
        success: false,
        error: "Product not found or you don't have permission to update it.",
      };
    }

    // If category is being updated, verify it exists
    if (validatedData.category_id) {
      const { data: categoryExists, error: categoryError } = await supabase
        .from("categories")
        .select("id")
        .eq("id", validatedData.category_id)
        .single();

      if (categoryError || !categoryExists) {
        return {
          success: false,
          error: "Selected category does not exist.",
        };
      }
    }

    // Update product
    const { data, error } = await supabase
      .from("products")
      .update({
        ...validatedData,
        edited_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
        *,
        category:categories(id, title)
      `
      )
      .single();

    if (error) {
      console.error("Error updating product:", error);
      return {
        success: false,
        error: "Failed to update product. Please try again.",
      };
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");

    return {
      success: true,
      data: data as Product,
    };
  } catch (error) {
    console.error("Unexpected error in updateProduct:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    if (!id || typeof id !== "string") {
      return {
        success: false,
        error: "Invalid product ID provided.",
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

    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from("products")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existingProduct) {
      return {
        success: false,
        error: "Product not found or you don't have permission to delete it.",
      };
    }

    // Delete product
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
      return {
        success: false,
        error: "Failed to delete product. Please try again.",
      };
    }

    revalidatePath("/admin/products");
    revalidatePath("/products");

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Unexpected error in deleteProduct:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function getProductsByCategory(
  categoryId: string
): Promise<ActionResult<Product[]>> {
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

    // Fetch products with category information
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        category:categories(id, title)
      `
      )
      .eq("category", categoryId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      return {
        success: false,
        error: "Failed to fetch products. Please try again.",
      };
    }

    return {
      success: true,
      data: data as Product[],
    };
  } catch (error) {
    console.error("Unexpected error in getProductByCategory:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

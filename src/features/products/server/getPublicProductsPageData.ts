"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult, Category, Product } from "@/lib/types";
import type { ProductListItem, PublicProductsPageData } from "../domain/types";
import { transformImagesToProxy } from "@/lib/utils/image-proxy";

const UNKNOWN_CATEGORY: ProductListItem["category"] = {
  id: "unknown",
  title: "Unknown",
  parent_category_id: null,
};

function normalizeProductForList(product: Product): ProductListItem {
  return {
    id: product.id,
    title: product.title,
    images: Array.isArray(product.images) ? product.images : [],
    thumbnail: Array.isArray(product.thumbnail) ? product.thumbnail : null,
    category: {
      id: product.category?.id ?? UNKNOWN_CATEGORY.id,
      title: product.category?.title ?? UNKNOWN_CATEGORY.title,
      parent_category_id:
        product.category?.parent_category_id ??
        UNKNOWN_CATEGORY.parent_category_id,
    },
  };
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient({ useCookies: false });
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("edited_at", { ascending: true });

  if (error || !data) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data as Category[];
}

async function getPublicProducts(): Promise<ActionResult<Product[]>> {
  try {
    const supabase = await createClient({ useCookies: false });

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        category:categories(id, title, parent_category_id)
      `,
      )
      .eq("is_active", true)
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
      data: (data || []).map((product) => {
        try {
          return {
            ...product,
            images: transformImagesToProxy(product.images || []),
          } as Product;
        } catch (error) {
          console.error("Error transforming product images:", error);
          return product as Product;
        }
      }),
    };
  } catch (error) {
    console.error("Unexpected error in getPublicProducts:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function getPublicProductsPageData(): Promise<
  ActionResult<PublicProductsPageData>
> {
  const [productsResult, categories] = await Promise.all([
    getPublicProducts(),
    getCategories(),
  ]);

  if (!productsResult.success) {
    return productsResult as ActionResult<PublicProductsPageData>;
  }

  return {
    success: true,
    data: {
      products: productsResult.data.map(normalizeProductForList),
      categories,
    },
  };
}

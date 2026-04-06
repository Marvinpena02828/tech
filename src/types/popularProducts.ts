/**
 * Popular Products Types
 * These types are used for CMS-managed popular product lineup
 */

export interface PopularProduct {
  id: string;
  product_id: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product?: ProductDetails;
}

export interface ProductDetails {
  id: string;
  title: string;
  images: string[];
  thumbnail?: string;
  category_id?: string;
}

export interface PopularProductWithDetails extends PopularProduct {
  product: ProductDetails;
}

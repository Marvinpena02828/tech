/**
 * Mega Menu Types
 * These types are used for the Products Mega Menu and can be managed via Admin Dashboard
 */

export interface FeaturedItem {
  id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category: FeaturedCategory;
  product: FeaturedProduct;
}

export interface FeaturedCategory {
  id: string;
  title: string;
  parent_category_id: string;
}

export interface FeaturedProduct {
  id: string;
  title: string;
  images: string[];
}

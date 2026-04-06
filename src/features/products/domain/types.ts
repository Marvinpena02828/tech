import type { Category } from "@/lib/types";

export interface ProductListCategory {
  id: string;
  title: string;
  parent_category_id: string | null;
}

export interface ProductListItem {
  id: string;
  title: string;
  images: string[];
  thumbnail: string[] | null;
  category: ProductListCategory;
}

export interface PublicProductsPageData {
  products: ProductListItem[];
  categories: Category[];
}

export interface ProductDetailModel {
  id: string;
  title: string;
  sku: string;
  category: {
    id: string;
    title: string;
  };
  tags: string[];
  short_description: string;
  images: string[];
  thumbnail: string[];
  features: string[];
  specifications: Record<string, string>;
  colors: Array<{ name: string; hex: string }>;
  description: string;
  video_link: string | null;
  downloads_link: string | null;
  relatedProducts: string[];
}

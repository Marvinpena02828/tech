export interface Product {
  id: string;
  name: string;
  title: string;
  sku: string;
  description: string;
  short_description?: string;
  created_at: string;
  edited_at: string;
  category_id: string;
  category?: {
    id: string;
    title: string;
    parent_category_id?: string | null;
  };
  tags?: string[];
  image_url?: string;
  images?: string[];
  thumbnail?: string[];
}
export interface Category {
  id: string;
  title: string;
  created_at: string;
  edited_at: string;
  description?: string;
  image_icon?: string;
  image_link?: string;
  parent_category_id?: string | null;
  is_highlighted: boolean;
}
export interface News {
  id: string;
  title: string;
  created_at: string;
  edited_at: string;
  caption: string;
  content: string;
  image_url: string;
}
export type BannerPageType = "homepage" | "products" | "featured";
export interface ProductBanner {
  id: string;
  mobile_banner: string;
  desktop_banner: string;
  mobile_video?: string | null;
  desktop_video?: string | null;
  page_type: BannerPageType;
  item_link?: string | null;
  // Legacy single-line heading (kept for backward compatibility)
  banner_heading?: string;
  heading_color?: string | null;
  heading_font_size?: string | null;
  heading_font_family?: string | null;
  // New multi-line heading support
  heading_line1?: string | null;
  line1_color?: string | null;
  line1_font_size?: string | null;
  line1_font_family?: string | null;
  heading_line2?: string | null;
  line2_color?: string | null;
  line2_font_size?: string | null;
  line2_font_family?: string | null;
  heading_line3?: string | null;
  line3_color?: string | null;
  line3_font_size?: string | null;
  line3_font_family?: string | null;
  created_at: string;
  updated_at: string;
}
export interface SectionSetting {
  id: string;
  section_name: string;
  is_visible: boolean;
  page: string;
  created_at: string;
  updated_at: string;
}
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

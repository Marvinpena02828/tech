'use server';

import { createClient } from '@/lib/supabase/server';
import type { FeaturedItem } from '@/types/megaMenu';

export interface MegaMenuCategory {
  id: string;
  title: string;
  href: string;
  description: string;
}

/**
 * Get all product categories for the mega menu
 */
export async function getCategoriesForMegaMenu(): Promise<MegaMenuCategory[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    // Map database categories to mega menu format
    const categories: MegaMenuCategory[] = (data || []).map((cat: any) => {
      const slug = cat.title.toLowerCase().replace(/\s+/g, '-');
      return {
        id: cat.id,
        title: cat.title,
        href: `/products?category=${slug}`,
        description: cat.description || `Browse our ${cat.title} collection`,
        parent_category_id: cat.parent_category_id,
      };
    });

    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

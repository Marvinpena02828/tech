"use server"
import { createClient } from "@/lib/supabase/server";

interface KPIStats {
  totalProducts: number;
  totalCategories: number;
  totalNews: number;
  totalUsers: number;
}

export async function getKPIStats(): Promise<KPIStats> {
  const supabase = await createClient();

  const [totalProducts, totalCategories, totalNews, totalUsers] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("categories").select("*", { count: "exact", head: true }),
      supabase.from("news").select("*", { count: "exact", head: true }),
      supabase.from("newsletter_subscriptions").select("*", { count: "exact", head: true }),
    ]);

  return {
    totalProducts: totalProducts.count || 0,
    totalCategories: totalCategories.count || 0,
    totalNews: totalNews.count || 0,
    totalUsers: totalUsers.count || 0,
  };
}

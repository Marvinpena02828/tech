import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/ProductForm";

export default async function NewProductPage() {
  const supabase = await createClient();

  // Fetch categories
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("title", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return <div>Failed to load categories</div>;
  }

  return <ProductForm categories={categories || []} />;
}

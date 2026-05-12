import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProductsPageClient from "./components/ProductsPageClient";

export default async function ProductsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  // Fetch products with category information
  const { data: products, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(id, title, parent_category_id)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return <div>Error loading products</div>;
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false });

  const mainCategories = categories?.filter((item) => item.parent_category_id === null)

  if (categoriesError) {
    console.error("Error fetching categories:", categoriesError);
    return <div>Error loading categories</div>;
  }

  return (
    <ProductsPageClient
      products={products || []}
      categories={mainCategories || []}
    />
  );
}

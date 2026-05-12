import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import ProductForm from "@/components/ProductForm";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  // Fetch the product
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (productError || !product) {
    notFound();
  }

  // Fetch categories
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("*")
    .order("title", { ascending: true });

  if (categoriesError) {
    console.error("Error fetching categories:", categoriesError);
    return <div>Failed to load categories</div>;
  }

  return <ProductForm productId={product.id} categories={categories || []} />;
}

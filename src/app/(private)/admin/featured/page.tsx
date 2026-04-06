import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import FeaturedContent from "./FeaturedContent";
import { CloudLightning } from "lucide-react";
import { getCategories } from "../categories/models/categories-model";
import { getProducts } from "../products/models/products-model";
import { getFeaturedItems } from "./models/featured-model";

export default async function FeaturedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  // Fetch all data
  const [featuredResult, categoriesResult, productsResult] = await Promise.all([
    getFeaturedItems(),
    getCategories(),
    getProducts(),
  ]);

  if (!categoriesResult.success || !productsResult.success) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <CloudLightning className="w-12 h-12 text-gray-400 animate-bounce" />
        <p className="mt-4 text-gray-500">Failed to load data.</p>
      </div>
    );
  }

  // Serialize data to ensure plain objects are passed to client component
  const serializedItems = JSON.parse(JSON.stringify(featuredResult.data || []));
  const serializedCategories = JSON.parse(
    JSON.stringify(categoriesResult.data || [])
  );
  const serializedProducts = JSON.parse(
    JSON.stringify(productsResult.data || [])
  );

  return (
    <FeaturedContent
      items={serializedItems}
      categories={serializedCategories}
      products={serializedProducts}
    />
  );
}

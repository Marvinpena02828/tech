import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PopularProductsContent from "./PopularProductsContent";
import { getAllPopularProducts } from "@/actions/popularProducts";

export default async function PopularProductsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const popularProducts = await getAllPopularProducts();

  return <PopularProductsContent popularProducts={popularProducts} />;
}

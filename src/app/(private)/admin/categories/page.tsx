import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CategoriesPageClient from "./components/CategoriesPageClient";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return <div>Error loading categories</div>;
  }

  return <CategoriesPageClient categories={categories || []} />;
}

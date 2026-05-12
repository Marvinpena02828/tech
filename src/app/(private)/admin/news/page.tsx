import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NewsContent from "./NewsContent";
 
export default async function NewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  // Fetch news
  const { data: news } = await supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false });

  // TODO: Add banner fetch after build passes
  // const { data: banner } = await supabase
  //   .from("news_banners")
  //   .select("*")
  //   .order("updated_at", { ascending: false })
  //   .limit(1)
  //   .single();

  return <NewsContent news={news || []} />;
}

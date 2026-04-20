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

  // Fetch news and banner in parallel
  const [newsResult, bannerResult] = await Promise.all([
    supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("news_banners")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single(),
  ]);

  const news = newsResult.data || [];
  const banner = bannerResult.data;

  return <NewsContent news={news} banner={banner} />;
}

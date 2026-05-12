import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getMarketingPhotos } from "./models/marketing-photos-model";
import MarketingPhotosContent from "./MarketingPhotosContent";

export default async function AboutMarketingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const { data: photos } = await getMarketingPhotos();

  return <MarketingPhotosContent photos={photos} />;
}

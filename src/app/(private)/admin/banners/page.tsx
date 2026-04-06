import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BannersContent from "./BannersContent";
import { getBanners } from "./models/banners-model";
import { ImageIcon } from "lucide-react";

export default async function BannersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  const bannersResult = await getBanners();

  if (!bannersResult.success) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <ImageIcon className="w-12 h-12 text-gray-400 animate-bounce" />
        <p className="mt-4 text-gray-500">Failed to load banners.</p>
      </div>
    );
  }

  

  return <BannersContent banners={bannersResult.data || []} />;
}

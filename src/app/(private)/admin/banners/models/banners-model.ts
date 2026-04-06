import { createClient } from "@/lib/supabase/server";
import { ProductBanner, ActionResult, BannerPageType } from "@/lib/types";
import { transformImageToProxy } from "@/lib/utils/image-proxy";
import { deleteBannerImage } from "@/lib/storage/bannersStorage";

function proxyBannerImages(banner: ProductBanner): ProductBanner {
  return {
    ...banner,
    mobile_banner: transformImageToProxy(banner.mobile_banner),
    desktop_banner: transformImageToProxy(banner.desktop_banner),
  };
}

export async function getBanners(): Promise<ActionResult<ProductBanner[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching banners:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Error fetching banners:", error);
    return { success: false, error: "Failed to fetch banners" };
  }
}

export async function getBannersByPageType(
  pageType: BannerPageType,
): Promise<ActionResult<ProductBanner | null>> {
  try {
    const supabase = await createClient({ useCookies: false });
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("page_type", pageType)
      .order("created_at", { ascending: false })
      .limit(2)
      .single();

    if (error) {
      // Handle no results gracefully
      if (error.code === "PGRST116") {
        return { success: true, data: null };
      }
      console.error(`Error fetching ${pageType} banner:`, error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: data ? proxyBannerImages(data) : null,
    };
  } catch (error) {
    console.error(`Error fetching ${pageType} banner:`, error);
    return { success: false, error: "Failed to fetch banner" };
  }
}

export async function getAllBannersByPageType(
  pageType: BannerPageType,
): Promise<ActionResult<ProductBanner[]>> {
  try {
    const supabase = await createClient({ useCookies: false });
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("page_type", pageType)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching ${pageType} banners:`, error);
      return { success: false, error: error.message };
    }

    const banners = data?.map(proxyBannerImages) || [];
    return { success: true, data: banners };
  } catch (error) {
    console.error(`Error fetching ${pageType} banners:`, error);
    return { success: false, error: "Failed to fetch banners" };
  }
}

export async function createBanner(
  mobileBanner: string,
  desktopBanner: string,
  pageType: BannerPageType,
  itemLink?: string,
): Promise<ActionResult<ProductBanner>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("banners")
      .insert({
        mobile_banner: mobileBanner,
        desktop_banner: desktopBanner,
        page_type: pageType,
        item_link: itemLink,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating banner:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data };
  } catch (error) {
    console.error("Error creating banner:", error);
    return { success: false, error: "Failed to create banner" };
  }
}

export async function updateBanner(
  id: string,
  updates: Partial<Omit<ProductBanner, "id" | "created_at" | "updated_at">>,
): Promise<ActionResult<ProductBanner>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("banners")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating banner:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data };
  } catch (error) {
    console.error("Error updating banner:", error);
    return { success: false, error: "Failed to update banner" };
  }
}

export async function deleteBanner(id: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();

    // Get banner data before deletion to clean up storage
    const { data: banner } = await supabase
      .from("banners")
      .select("mobile_banner, desktop_banner")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("banners").delete().eq("id", id);

    if (error) {
      console.error("Error deleting banner:", error);
      return { success: false, error: error.message };
    }

    // Delete images from storage
    if (banner) {
      await deleteBannerImage(banner.mobile_banner);
      await deleteBannerImage(banner.desktop_banner);
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting banner:", error);
    return { success: false, error: "Failed to delete banner" };
  }
}

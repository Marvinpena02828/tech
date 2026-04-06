"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductBanner, BannerPageType } from "@/lib/types";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { deleteBannerImageClient } from "@/lib/storage/bannersStorageClient";

export function useBanners(initialBanners: ProductBanner[]) {
  const router = useRouter();
  const [banners, setBanners] = useState<ProductBanner[]>(initialBanners);
  const [isLoading, setIsLoading] = useState(false);

  const createBanner = async (
    mobileBanner: string,
    desktopBanner: string,
    pageType: BannerPageType,
    itemLink?: string,
    headingLine1?: string,
    line1Color?: string,
    line1FontSize?: string,
    line1FontFamily?: string,
    headingLine2?: string,
    line2Color?: string,
    line2FontSize?: string,
    line2FontFamily?: string,
    headingLine3?: string,
    line3Color?: string,
    line3FontSize?: string,
    line3FontFamily?: string,
  ) => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("banners")
        .insert({
          mobile_banner: mobileBanner,
          desktop_banner: desktopBanner,
          page_type: pageType,
          item_link: itemLink || null,
          heading_line1: headingLine1 || null,
          line1_color: line1Color || null,
          line1_font_size: line1FontSize || null,
          line1_font_family: line1FontFamily || null,
          heading_line2: headingLine2 || null,
          line2_color: line2Color || null,
          line2_font_size: line2FontSize || null,
          line2_font_family: line2FontFamily || null,
          heading_line3: headingLine3 || null,
          line3_color: line3Color || null,
          line3_font_size: line3FontSize || null,
          line3_font_family: line3FontFamily || null,
        })
        .select()
        .single();

      if (error) throw error;

      setBanners([data, ...banners]);
      toast.success("Banner created successfully");
      router.refresh();
      return { success: true, data };
    } catch (error: any) {
      toast.error(error.message || "Failed to create banner");
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateBanner = async (
    id: string,
    updates: Partial<Omit<ProductBanner, "id" | "created_at" | "updated_at">>,
    oldMobileUrl?: string,
    oldDesktopUrl?: string,
  ) => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("banners")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Delete old images from storage if new ones were uploaded
      if (
        oldMobileUrl &&
        updates.mobile_banner &&
        oldMobileUrl !== updates.mobile_banner
      ) {
        await deleteBannerImageClient(oldMobileUrl);
      }
      if (
        oldDesktopUrl &&
        updates.desktop_banner &&
        oldDesktopUrl !== updates.desktop_banner
      ) {
        await deleteBannerImageClient(oldDesktopUrl);
      }

      setBanners(banners.map((b) => (b.id === id ? data : b)));
      toast.success("Banner updated successfully");
      router.refresh();
      return { success: true, data };
    } catch (error: any) {
      toast.error(error.message || "Failed to update banner");
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBanner = async (id: string) => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      // Get banner data before deletion to clean up storage
      const banner = banners.find((b) => b.id === id);

      const { error } = await supabase.from("banners").delete().eq("id", id);

      if (error) throw error;

      // Delete images from storage
      if (banner) {
        await deleteBannerImageClient(banner.mobile_banner);
        await deleteBannerImageClient(banner.desktop_banner);
      }

      setBanners(banners.filter((b) => b.id !== id));
      toast.success("Banner deleted successfully");
      router.refresh();
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || "Failed to delete banner");
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    banners,
    isLoading,
    createBanner,
    updateBanner,
    deleteBanner,
  };
}

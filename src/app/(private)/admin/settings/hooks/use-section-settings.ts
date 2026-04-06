"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SectionSetting } from "@/lib/types";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

export function useSectionSettings(initialSettings: SectionSetting[]) {
  const router = useRouter();
  const [settings, setSettings] = useState<SectionSetting[]>(initialSettings);
  const [isLoading, setIsLoading] = useState(false);

  const createSetting = async (
    sectionName: string,
    page: string,
    isVisible: boolean = true
  ) => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("section_settings")
        .insert({
          section_name: sectionName,
          page: page,
          is_visible: isVisible,
        })
        .select()
        .single();

      if (error) throw error;

      setSettings([...settings, data]);
      toast.success("Section setting created successfully");
      router.refresh();
      return { success: true, data };
    } catch (error: any) {
      toast.error(error.message || "Failed to create section setting");
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateVisibility = async (sectionName: string, isVisible: boolean) => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("section_settings")
        .update({ is_visible: isVisible })
        .eq("section_name", sectionName)
        .select()
        .single();

      if (error) throw error;

      setSettings(
        settings.map((s) => (s.section_name === sectionName ? data : s))
      );
      toast.success(
        `Section ${isVisible ? "enabled" : "disabled"} successfully`
      );
      router.refresh();
      return { success: true, data };
    } catch (error: any) {
      toast.error(error.message || "Failed to update section visibility");
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSetting = async (id: string) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("section_settings")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setSettings(settings.filter((s) => s.id !== id));
      toast.success("Section setting deleted successfully");
      router.refresh();
      return { success: true };
    } catch (error: any) {
      toast.error(error.message || "Failed to delete section setting");
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    settings,
    isLoading,
    createSetting,
    updateVisibility,
    deleteSetting,
  };
}

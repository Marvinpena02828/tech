import { createClient } from "@/lib/supabase/server";
import { SectionSetting, ActionResult } from "@/lib/types";

export async function getSectionSettings(): Promise<
  ActionResult<SectionSetting[]>
> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("section_settings")
      .select("*")
      .order("page", { ascending: true });

    if (error) {
      console.error("Error fetching section settings:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Error fetching section settings:", error);
    return { success: false, error: "Failed to fetch section settings" };
  }
}

export async function getSectionSetting(
  sectionName: string,
): Promise<ActionResult<SectionSetting | null>> {
  try {
    const supabase = await createClient({ useCookies: false });
    const { data, error } = await supabase
      .from("section_settings")
      .select("*")
      .eq("section_name", sectionName)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { success: true, data: null };
      }
      console.error(`Error fetching ${sectionName} setting:`, error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data };
  } catch (error) {
    console.error(`Error fetching ${sectionName} setting:`, error);
    return { success: false, error: "Failed to fetch section setting" };
  }
}

export async function updateSectionVisibility(
  sectionName: string,
  isVisible: boolean,
): Promise<ActionResult<SectionSetting>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("section_settings")
      .update({ is_visible: isVisible })
      .eq("section_name", sectionName)
      .select()
      .single();

    if (error) {
      console.error("Error updating section visibility:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data };
  } catch (error) {
    console.error("Error updating section visibility:", error);
    return { success: false, error: "Failed to update section visibility" };
  }
}

export async function isSectionVisible(sectionName: string): Promise<boolean> {
  const result = await getSectionSetting(sectionName);

  if (!result.success || !result.data) {
    // Default to visible if setting doesn't exist or error occurs
    return true;
  }

  return result.data.is_visible;
}

"use server";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/lib/types/database";

export type PromotionalBar =
  Database["public"]["Tables"]["promotional_bars"]["Row"];

/**
 * Get all promotional bars (admin view)
 */
export async function getAllPromotionalBars() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("promotional_bars")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Error fetching promotional bars:", error);
    return {
      success: false,
      error: "Failed to fetch promotional bars",
      data: [],
    };
  }
}

/**
 * Get active promotional bar (frontend view)
 */
export async function getActivePromotionalBar() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("promotional_bars")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows

    return {
      success: true,
      data: data || null,
    };
  } catch (error) {
    console.error("Error fetching active promotional bar:", error);
    return {
      success: false,
      error: "Failed to fetch promotional bar",
      data: null,
    };
  }
}

/**
 * Create promotional bar
 */
export async function createPromotionalBar({
  message,
  backgroundColor = "#D4B896",
  textColor = "#1F2937",
}: {
  message: string;
  backgroundColor?: string;
  textColor?: string;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const { data, error } = await supabase
      .from("promotional_bars")
      .insert({
        message,
        background_color: backgroundColor,
        text_color: textColor,
        is_active: false, // Default to inactive, admins can activate
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: "Promotional bar created successfully",
    };
  } catch (error) {
    console.error("Error creating promotional bar:", error);
    return {
      success: false,
      error: "Failed to create promotional bar",
    };
  }
}

/**
 * Update promotional bar
 */
export async function updatePromotionalBar(
  id: string,
  {
    message,
    backgroundColor,
    textColor,
    isActive,
  }: {
    message?: string;
    backgroundColor?: string;
    textColor?: string;
    isActive?: boolean;
  }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const updates: Record<string, unknown> = {};

    if (message !== undefined) updates.message = message;
    if (backgroundColor !== undefined)
      updates.background_color = backgroundColor;
    if (textColor !== undefined) updates.text_color = textColor;
    if (isActive !== undefined) updates.is_active = isActive;

    updates.updated_by = user.id;

    const { data, error } = await supabase
      .from("promotional_bars")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: "Promotional bar updated successfully",
    };
  } catch (error) {
    console.error("Error updating promotional bar:", error);
    return {
      success: false,
      error: "Failed to update promotional bar",
    };
  }
}

/**
 * Toggle promotional bar active status
 */
export async function togglePromotionalBar(id: string, isActive: boolean) {
  return updatePromotionalBar(id, { isActive });
}

/**
 * Delete promotional bar
 */
export async function deletePromotionalBar(id: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("promotional_bars")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return {
      success: true,
      message: "Promotional bar deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting promotional bar:", error);
    return {
      success: false,
      error: "Failed to delete promotional bar",
    };
  }
}

/**
 * Deactivate all promotional bars except one
 */
export async function setActivePromotionalBar(idToActivate: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    // Deactivate all
    await supabase
      .from("promotional_bars")
      .update({
        is_active: false,
        updated_by: user.id,
      })
      .neq("id", idToActivate);

    // Activate selected
    const { data, error } = await supabase
      .from("promotional_bars")
      .update({
        is_active: true,
        updated_by: user.id,
      })
      .eq("id", idToActivate)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: "Promotional bar activated successfully",
    };
  } catch (error) {
    console.error("Error setting active promotional bar:", error);
    return {
      success: false,
      error: "Failed to activate promotional bar",
    };
  }
}

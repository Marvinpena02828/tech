"use server";

import { createClient } from "@/lib/supabase/server";
import { ContactInfo } from "@/types/contactInfo";
import { revalidatePath } from "next/cache";

/**
 * Fetch all active contact info items ordered by display_order
 */
export async function getContactInfo(): Promise<ContactInfo[]> {
  try {
    const supabase = await createClient({ useCookies: false });

    const { data, error } = await supabase
      .from("contact_info")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching contact info:", error);
      return [];
    }

    return data as ContactInfo[];
  } catch (error) {
    console.error("Unexpected error fetching contact info:", error);
    return [];
  }
}

/**
 * Fetch all contact info items (including inactive) for admin
 */
export async function getAllContactInfo(): Promise<ContactInfo[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("contact_info")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching all contact info:", error);
      return [];
    }

    return data as ContactInfo[];
  } catch (error) {
    console.error("Unexpected error fetching all contact info:", error);
    return [];
  }
}

/**
 * Create a new contact info item
 */
export async function createContactInfo(
  data: Omit<ContactInfo, "id" | "created_at" | "updated_at">,
) {
  try {
    const supabase = await createClient();

    const { data: newItem, error } = await supabase
      .from("contact_info")
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error("Error creating contact info:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/contact");
    revalidatePath("/admin/contact-info");

    return { success: true, data: newItem };
  } catch (error: any) {
    console.error("Unexpected error creating contact info:", error);
    return {
      success: false,
      error: error.message || "Failed to create contact info",
    };
  }
}

/**
 * Update an existing contact info item
 */
export async function updateContactInfo(
  id: string,
  data: Partial<Omit<ContactInfo, "id" | "created_at" | "updated_at">>,
) {
  try {
    const supabase = await createClient();

    const { data: updatedItem, error } = await supabase
      .from("contact_info")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating contact info:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/contact");
    revalidatePath("/admin/contact-info");

    return { success: true, data: updatedItem };
  } catch (error: any) {
    console.error("Unexpected error updating contact info:", error);
    return {
      success: false,
      error: error.message || "Failed to update contact info",
    };
  }
}

/**
 * Delete a contact info item
 */
export async function deleteContactInfo(id: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("contact_info").delete().eq("id", id);

    if (error) {
      console.error("Error deleting contact info:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/contact");
    revalidatePath("/admin/contact-info");

    return { success: true };
  } catch (error: any) {
    console.error("Unexpected error deleting contact info:", error);
    return {
      success: false,
      error: error.message || "Failed to delete contact info",
    };
  }
}

/**
 * Toggle active status of a contact info item
 */
export async function toggleContactInfoStatus(id: string, isActive: boolean) {
  return updateContactInfo(id, { is_active: isActive });
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { Address } from "@/types/address";
import { revalidatePath } from "next/cache";

/**
 * Fetch all active addresses for a specific company
 */
export async function getAddressesByCompany(companyId: number): Promise<Address[]> {
  try {
    const supabase = await createClient({ useCookies: false });

    const { data, error } = await supabase
      .from("address")
      .select("*")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching addresses:", error);
      return [];
    }

    return data as Address[];
  } catch (error) {
    console.error("Unexpected error fetching addresses:", error);
    return [];
  }
}

/**
 * Fetch all addresses (including inactive) for admin
 */
export async function getAllAddresses(): Promise<Address[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("address")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching all addresses:", error);
      return [];
    }

    return data as Address[];
  } catch (error) {
    console.error("Unexpected error fetching all addresses:", error);
    return [];
  }
}

/**
 * Fetch all addresses for a company (including inactive) for admin
 */
export async function getAddressesByCompanyAdmin(companyId: number): Promise<Address[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("address")
      .select("*")
      .eq("company_id", companyId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching addresses:", error);
      return [];
    }

    return data as Address[];
  } catch (error) {
    console.error("Unexpected error fetching addresses:", error);
    return [];
  }
}

/**
 * Create a new address
 */
export async function createAddress(
  data: Omit<Address, "id" | "created_at" | "updated_at" | "full_address">,
) {
  try {
    const supabase = await createClient();

    const { data: newItem, error } = await supabase
      .from("address")
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error("Error creating address:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/contact");
    revalidatePath("/admin/address");

    return { success: true, data: newItem };
  } catch (error: any) {
    console.error("Unexpected error creating address:", error);
    return {
      success: false,
      error: error.message || "Failed to create address",
    };
  }
}

/**
 * Update an existing address
 */
export async function updateAddress(
  id: string,
  data: Partial<
    Omit<Address, "id" | "created_at" | "updated_at" | "full_address">
  >,
) {
  try {
    const supabase = await createClient();

    const { data: updatedItem, error } = await supabase
      .from("address")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating address:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/contact");
    revalidatePath("/admin/address");

    return { success: true, data: updatedItem };
  } catch (error: any) {
    console.error("Unexpected error updating address:", error);
    return {
      success: false,
      error: error.message || "Failed to update address",
    };
  }
}

/**
 * Delete an address
 */
export async function deleteAddress(id: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("address").delete().eq("id", id);

    if (error) {
      console.error("Error deleting address:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/contact");
    revalidatePath("/admin/address");

    return { success: true };
  } catch (error: any) {
    console.error("Unexpected error deleting address:", error);
    return {
      success: false,
      error: error.message || "Failed to delete address",
    };
  }
}

/**
 * Toggle address active status
 */
export async function toggleAddressStatus(id: string, isActive: boolean) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("address")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) {
      console.error("Error toggling address status:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/contact");
    revalidatePath("/admin/address");

    return { success: true };
  } catch (error: any) {
    console.error("Unexpected error toggling address status:", error);
    return {
      success: false,
      error: error.message || "Failed to toggle address status",
    };
  }
}

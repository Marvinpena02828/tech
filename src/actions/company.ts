"use server";

import { createClient } from "@/lib/supabase/server";
import { Company, CompanyCreateInput, CompanyUpdateInput } from "@/types/company";
import { revalidatePath } from "next/cache";

/**
 * Fetch all active companies
 */
export async function getCompanies(): Promise<Company[]> {
  try {
    const supabase = await createClient({ useCookies: false });

    const { data, error } = await supabase
      .from("company_info")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching companies:", error);
      return [];
    }

    return data as Company[];
  } catch (error) {
    console.error("Unexpected error fetching companies:", error);
    return [];
  }
}

/**
 * Fetch all companies (including inactive) for admin
 */
export async function getAllCompanies(): Promise<Company[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("company_info")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching all companies:", error);
      return [];
    }

    return data as Company[];
  } catch (error) {
    console.error("Unexpected error fetching all companies:", error);
    return [];
  }
}

/**
 * Fetch a single company by ID
 */
export async function getCompanyById(id: number): Promise<Company | null> {
  try {
    const supabase = await createClient({ useCookies: false });

    const { data, error } = await supabase
      .from("company_info")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching company:", error);
      return null;
    }

    return data as Company;
  } catch (error) {
    console.error("Unexpected error fetching company:", error);
    return null;
  }
}

/**
 * Fetch company by slug
 */
export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  try {
    const supabase = await createClient({ useCookies: false });

    const { data, error } = await supabase
      .from("company_info")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching company by slug:", error);
      return null;
    }

    return data as Company;
  } catch (error) {
    console.error("Unexpected error fetching company by slug:", error);
    return null;
  }
}

/**
 * Create a new company
 */
export async function createCompany(data: CompanyCreateInput) {
  try {
    const supabase = await createClient();

    const { data: newItem, error } = await supabase
      .from("company_info")
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error("Error creating company:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/companies");

    return { success: true, data: newItem };
  } catch (error: any) {
    console.error("Unexpected error creating company:", error);
    return {
      success: false,
      error: error.message || "Failed to create company",
    };
  }
}

/**
 * Update an existing company
 */
export async function updateCompany(id: number, data: CompanyUpdateInput) {
  try {
    const supabase = await createClient();

    const { data: updatedItem, error } = await supabase
      .from("company_info")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating company:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/companies");
    revalidatePath("/contact");

    return { success: true, data: updatedItem };
  } catch (error: any) {
    console.error("Unexpected error updating company:", error);
    return {
      success: false,
      error: error.message || "Failed to update company",
    };
  }
}

/**
 * Delete a company
 */
export async function deleteCompany(id: number) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("company_info")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting company:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/companies");
    revalidatePath("/contact");

    return { success: true };
  } catch (error: any) {
    console.error("Unexpected error deleting company:", error);
    return {
      success: false,
      error: error.message || "Failed to delete company",
    };
  }
}

/**
 * Toggle company active status
 */
export async function toggleCompanyStatus(id: number, isActive: boolean) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("company_info")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) {
      console.error("Error toggling company status:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/companies");
    revalidatePath("/contact");

    return { success: true };
  } catch (error: any) {
    console.error("Unexpected error toggling company status:", error);
    return {
      success: false,
      error: error.message || "Failed to toggle company status",
    };
  }
}

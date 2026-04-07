/**
 * Company Type Definitions
 * Database table: company_info
 */
export interface Company {
  id: number;
  name: string;
  slug: string;
  domain?: string | null;
  logo_url?: string | null;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CompanyCreateInput = Omit<
  Company,
  "id" | "created_at" | "updated_at"
>;

export type CompanyUpdateInput = Partial<CompanyCreateInput>;

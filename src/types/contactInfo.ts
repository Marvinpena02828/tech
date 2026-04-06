/**
 * Contact Info Types
 * These types are used for CMS-managed contact information
 */

export interface ContactInfo {
  id: string;
  icon_name: string;
  title: string;
  label: string;
  link: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ContactInfoCreateInput = Omit<
  ContactInfo,
  "id" | "created_at" | "updated_at"
>;

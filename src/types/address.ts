/**
 * Address Type Definitions
 * Database table: address
 */

export interface Address {
  id: string;
  title: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state_province?: string | null;
  postal_code?: string | null;
  country: string;
  full_address?: string; // Generated field
  map_link?: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type AddressCreateInput = Omit<
  Address,
  "id" | "created_at" | "updated_at" | "full_address"
>;

// lib/types/floating-contact-buttons.ts

export interface ContactButton {
  id: number;
  name: string;
  sub_name: string | null;
  link: string;
  icon_file_path: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateContactButtonInput {
  name: string;
  sub_name?: string;
  link: string;
  icon_file_path?: string;
  order_index?: number;
  is_active?: boolean;
}

export interface UpdateContactButtonInput
  extends Partial<CreateContactButtonInput> {
  id: number;
}

export interface ContactButtonFormData {
  name: string;
  sub_name: string;
  link: string;
  icon_file_path: string;
  order_index: number;
  is_active: boolean;
}

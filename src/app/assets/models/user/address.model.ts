export interface Address {
  id: number;
  userId: number;
  recipient_name: string;
  recipient_phone: string;
  street: string;
  ext_number: string;
  int_number?: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  references?: string;
  is_default: boolean;
  created_at: Date;
}

export interface CreateAddressRequest {
  recipient_name: string;
  recipient_phone: string;
  street: string;
  ext_number: string;
  int_number?: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  references?: string;
  is_default?: boolean;
}

export interface UpdateAddressRequest {
  recipient_name?: string;
  recipient_phone?: string;
  street?: string;
  ext_number?: string;
  int_number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  references?: string;
  is_default?: boolean;
}

export enum OfferType {
  PERCENTAGE = 'percentage',
  FIXED_PRICE = 'fixed_price',
  TWO_FOR_ONE = 'two_for_one',
  BUNDLE = 'bundle'
}

export interface Offer {
  id: number;
  productId: number;
  type: OfferType;
  label: string;
  discount_value?: number;
  bundle_quantity?: number;
  is_active: boolean;
  starts_at?: Date | string;
  ends_at?: Date | string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  image: string;
  price: number;
  stock: number;
  offer?: Offer | null;
  final_price?: number;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface CreateProductRequest {
  title: string;
  description: string;
  image: string;
  price: number;
  stock: number;
}

export interface UpdateProductRequest {
  title?: string;
  description?: string;
  image?: string;
  price?: number;
  stock?: number;
}

export interface CreateOfferRequest {
  type: OfferType;
  label: string;
  discount_value?: number;
  bundle_quantity?: number;
  is_active?: boolean;
  starts_at?: Date | string;
  ends_at?: Date | string;
}

export interface UpdateOfferRequest {
  label?: string;
  discount_value?: number;
  bundle_quantity?: number;
  is_active?: boolean;
  starts_at?: Date | string;
  ends_at?: Date | string;
}

export interface ProductResponse {
  products: Product[];
  total: number;
}


export enum OfferType {
  PERCENTAGE = 'percentage',
  FIXED_PRICE = 'fixed_price',
  TWO_FOR_ONE = 'two_for_one',
  BUNDLE = 'bundle'
}

export enum ProductCategory {
  DISFRACES = 'disfraces',
  VIBRADORES = 'vibradores',
  JUGUETES = 'juguetes',
  LENCERIA = 'lenceria',
  ACCESORIOS = 'accesorios',
  LUBRICANTES = 'lubricantes',
  CONDONES = 'condones',
  JUEGOS = 'juegos',
  ACEITES = 'aceites',
  BONDAGE = 'bondage',
  MASCARAS = 'mascaras',
  MUÑECAS = 'muñecas',
  OTROS = 'otros',
}

export interface Offer {
  id: number;
  productId: number;
  type: OfferType;
  label: string;
  discount_value: number | null;
  bundle_quantity: number | null;
  is_active: boolean | null;
  starts_at: Date | string | null;
  ends_at: Date | string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  image: string;
  price: number;
  stock: number;
  category?: ProductCategory;
  offer?: Offer | null;
  final_price?: number;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface CategoryWithCount {
  category: ProductCategory;
  count: number;
}

export interface CreateProductRequest {
  title: string;
  description: string;
  image: string;
  price: number;
  stock: number;
  category?: ProductCategory;
}

export interface UpdateProductRequest {
  title?: string;
  description?: string;
  image?: string;
  price?: number;
  stock?: number;
  category?: ProductCategory;
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

export interface ProductFilters {
  search?: string;
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  inStock?: boolean;
}

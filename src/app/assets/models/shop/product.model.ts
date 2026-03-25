export interface Product {
  id: number;
  title: string;
  description: string;
  image: string;
  price: number;
  stock: number;
  created_at: Date;
  updated_at: Date;
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

export interface ProductResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

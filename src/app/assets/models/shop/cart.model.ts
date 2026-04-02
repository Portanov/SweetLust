import { Product } from "./product.model";

export interface CartItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartSummary {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartResponse {
  cart: Cart;
  summary: CartSummary;
}

export interface CheckoutRequest {
  addressId: number;
  paymentMethod?: string;
  notes?: string;
}

export interface CheckoutResponse {
  message: string;
  orderId: number;
  status: string;
  tracking: {
    id: number;
    status: string;
    note: string;
    createdAt: Date;
  };
}

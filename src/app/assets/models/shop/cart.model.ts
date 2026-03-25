export interface CartItem {
  id: number;
  productId: number;
  product: {
    id: number;
    title: string;
    description: string;
    image: string;
    price: number;
    stock: number;
  };
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

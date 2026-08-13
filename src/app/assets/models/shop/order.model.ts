export enum OrderStatus {
  PROCESANDO = 'procesando',
  CONFIRMADO = 'confirmado',
  ENVIADO = 'enviado',
  EN_CAMINO = 'en_camino',
  ENTREGADO = 'entregado',
  CANCELADO = 'cancelado'
}

export interface OrderTracking {
  id: number;
  orderId: number;
  status: OrderStatus;
  note: string;
  created_at: Date;
}

export interface OrderItem {
  id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product: {
    id: number;
    title: string;
    description: string;
    image: string;
    price: number;
    stock?: number;
  };
}

export interface OrderAddress {
  recipient_name: string;
  recipient_phone: string;
  street: string;
  ext_number: string;
  int_number?: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
}

export interface Order {
  id: number;
  status: OrderStatus;
  total: number;
  created_at: Date;
  address?: OrderAddress;
  user?: {
    id: number;
    username: string;
    email: string;
  };
  items: OrderItem[];
  tracking?: OrderTracking[];
}

export interface OrderResponse {
  id: number;
  status: OrderStatus;
  total: number;
  created_at: Date;
  address?: OrderAddress;
  items: OrderItem[];
  tracking: OrderTracking[];
}

export interface CancelOrderResponse {
  message: string;
  orderId: number;
}

export interface PublicTrackingResponse {
  orderId: number;
  status: OrderStatus;
  created_at: Date;
  history: OrderTracking[];
}

export interface UpdateTrackingRequest {
  status: OrderStatus;
  note?: string;
}

export interface TopSellingProduct {
  productId: number;
  name: string;
  image: string;
  soldQuantity: number;
}

export interface DailySalesByDay {
  day: string;
  salesCount: number;
}

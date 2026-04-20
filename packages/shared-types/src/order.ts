export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  product?: {
    id: number;
    name: string;
    sku: string;
  };
}

export interface Order {
  id: number;
  userId: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  shippingAddress: string;
  billingAddress: string | null;
  notes: string | null;
  items: OrderItem[];
  user?: {
    id: number;
    email: string;
    name?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  userId: number;
  items: { productId: number; quantity: number }[];
  shippingAddress: string;
  billingAddress?: string;
  notes?: string;
}

export interface UpdateOrderDto {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  shippingAddress?: string;
  billingAddress?: string | null;
  notes?: string | null;
}

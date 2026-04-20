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
  userId: number | null;
  customerId: number | null;
  stripePaymentIntentId: string | null;
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

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface CreateCheckoutDto {
  items: { productId: number; quantity: number }[];
  shippingAddress: ShippingAddress;
}

export interface CheckoutSessionResponse {
  clientSecret: string;
}

export interface CreateOrderDto {
  userId?: number | null;
  customerId?: number | null;
  items: { productId: number; quantity: number }[];
  shippingAddress: string;
  billingAddress?: string;
  notes?: string;
  stripePaymentIntentId?: string;
}

export interface UpdateOrderDto {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  shippingAddress?: string;
  billingAddress?: string | null;
  notes?: string | null;
}

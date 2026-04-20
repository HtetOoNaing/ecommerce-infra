export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItemEntity {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  product?: {
    id: number;
    name: string;
    sku: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderEntity {
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
  items?: OrderItemEntity[];
  user?: {
    id: number;
    email: string;
    name?: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemDto {
  productId: number;
  quantity: number;
}

export interface CreateOrderDto {
  userId?: number | null;
  customerId?: number | null;
  items: OrderItemDto[];
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

export interface OrderResponseDto {
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
  items: OrderItemResponseDto[];
  user?: {
    id: number;
    email: string;
    name?: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemResponseDto {
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

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

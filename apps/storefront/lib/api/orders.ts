import { apiClient, ApiError } from "./client";
import type {
  Order,
  CreateCheckoutDto,
  CheckoutSessionResponse,
} from "@infrapro/shared-types";

export type { CreateCheckoutDto };

export interface CreateOrderPayload {
  items: Array<{ productId: number; quantity: number }>;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export async function createCheckoutSession(
  dto: CreateCheckoutDto
): Promise<CheckoutSessionResponse> {
  const response = await apiClient.post<CheckoutSessionResponse>("/checkout", dto);
  return response.data;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const response = await apiClient.post<Order>("/orders", payload);
  return response.data;
}

export async function getCustomerOrders(): Promise<Order[]> {
  const response = await apiClient.get<Order[]>("/customer/orders");
  return response.data;
}

export async function getOrder(id: string): Promise<Order> {
  const response = await apiClient.get<Order>(`/customer/orders/${id}`);
  return response.data;
}

export { ApiError };

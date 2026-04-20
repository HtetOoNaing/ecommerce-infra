import { apiClient, ApiError } from "./client";
import type { Order } from "@infrapro/shared-types";

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

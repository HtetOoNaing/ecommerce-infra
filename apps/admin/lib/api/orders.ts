import { request } from "./client";
import type {
  Order,
  CreateOrderDto,
  UpdateOrderDto,
  PaginatedResponse,
} from "@/lib/types";

export async function getOrders(
  page?: number,
  limit?: number
): Promise<PaginatedResponse<Order>> {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));

  const query = params.toString();
  const url = `/orders${query ? `?${query}` : ""}`;

  return request<PaginatedResponse<Order>>(url, { method: "GET" });
}

export async function getOrder(id: number): Promise<Order> {
  return request<Order>(`/orders/${id}`, { method: "GET" });
}

export async function getOrdersByUser(
  userId: number,
  page?: number,
  limit?: number
): Promise<PaginatedResponse<Order>> {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));

  const query = params.toString();
  const url = `/orders/user/${userId}${query ? `?${query}` : ""}`;

  return request<PaginatedResponse<Order>>(url, { method: "GET" });
}

export async function createOrder(data: CreateOrderDto): Promise<Order> {
  return request<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateOrder(
  id: number,
  data: UpdateOrderDto
): Promise<Order> {
  return request<Order>(`/orders/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteOrder(id: number): Promise<void> {
  return request<void>(`/orders/${id}`, { method: "DELETE" });
}

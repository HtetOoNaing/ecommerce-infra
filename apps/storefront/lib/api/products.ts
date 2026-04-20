import { apiClient } from "./client";
import type { Product, PaginatedResponse } from "@infrapro/shared-types";

export async function getProducts(
  page = 1,
  limit = 12
): Promise<PaginatedResponse<Product>> {
  const response = await apiClient.get<PaginatedResponse<Product>>("/products", {
    params: { page, limit },
  });
  return response.data;
}

export async function getProduct(id: number): Promise<Product> {
  const response = await apiClient.get<Product>(`/products/${id}`);
  return response.data;
}

export async function searchProducts(
  query: string,
  page = 1,
  limit = 12
): Promise<PaginatedResponse<Product>> {
  const response = await apiClient.get<PaginatedResponse<Product>>("/products", {
    params: { q: query, page, limit },
  });
  return response.data;
}

export async function getProductsByCategory(
  categoryId: number,
  page = 1,
  limit = 12
): Promise<PaginatedResponse<Product>> {
  const response = await apiClient.get<PaginatedResponse<Product>>("/products", {
    params: { categoryId, page, limit },
  });
  return response.data;
}

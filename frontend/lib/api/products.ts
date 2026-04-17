import type { Product, CreateProductDto, UpdateProductDto } from "../types";
import { request } from "./client";

export { ApiError } from "./client";

export async function getProducts(): Promise<Product[]> {
  return request<Product[]>("/products");
}

export async function getProduct(id: number): Promise<Product> {
  return request<Product>(`/products/${id}`);
}

export async function createProduct(data: CreateProductDto): Promise<Product> {
  return request<Product>("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id: number, data: UpdateProductDto): Promise<Product> {
  return request<Product>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: number): Promise<void> {
  return request<void>(`/products/${id}`, { method: "DELETE" });
}

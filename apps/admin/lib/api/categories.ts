import { request } from "./client";
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  PaginatedResponse,
} from "@/lib/types";

export async function getCategories(
  page?: number,
  limit?: number
): Promise<PaginatedResponse<Category>> {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));

  const query = params.toString();
  const url = `/categories${query ? `?${query}` : ""}`;

  return request<PaginatedResponse<Category>>(url, { method: "GET" });
}

export async function getCategory(id: number): Promise<Category> {
  return request<Category>(`/categories/${id}`, { method: "GET" });
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  return request<Category>(`/categories/slug/${slug}`, { method: "GET" });
}

export async function createCategory(data: CreateCategoryDto): Promise<Category> {
  return request<Category>("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCategory(
  id: number,
  data: UpdateCategoryDto
): Promise<Category> {
  return request<Category>(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: number): Promise<void> {
  return request<void>(`/categories/${id}`, { method: "DELETE" });
}

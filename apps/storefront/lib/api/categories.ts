import { apiClient } from "./client";
import type { Category } from "@infrapro/shared-types";

export async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get<Category[]>("/categories");
  return response.data;
}

export async function getCategory(id: number): Promise<Category> {
  const response = await apiClient.get<Category>(`/categories/${id}`);
  return response.data;
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  const response = await apiClient.get<Category>(`/categories/slug/${slug}`);
  return response.data;
}

import type { User, PaginatedResponse } from "../types";
import { request } from "./client";

export { ApiError } from "./client";

export async function getUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
  return request<PaginatedResponse<User>>(`/users?page=${page}&limit=${limit}`);
}

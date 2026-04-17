import type { User } from "../types";
import { request } from "./client";

export { ApiError } from "./client";

export async function getUsers(): Promise<User[]> {
  return request<User[]>("/users");
}

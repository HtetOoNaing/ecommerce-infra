import type { LoginResponse, RegisterResponse } from "../types";
import { request, clearAuth, loginWithTokens, registerWithTokens } from "./client";

export { ApiError } from "./client";

export async function login(email: string, password: string): Promise<LoginResponse> {
  return loginWithTokens(email, password);
}

export async function register(
  email: string,
  password: string,
  name?: string
): Promise<RegisterResponse> {
  return registerWithTokens(email, password, name);
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  return request("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function logout(): Promise<void> {
  try {
    await request("/auth/logout", { method: "POST" });
  } finally {
    clearAuth();
  }
}

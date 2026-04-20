import {
  createApiClient,
  ApiError,
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  clearAuth,
} from "@infrapro/api-client";
import type { LoginResponse, RegisterResponse } from "@infrapro/shared-types";

export {
  ApiError,
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  clearAuth,
};

// ─── Admin axios instance ─────────────────────────────
export const apiClient = createApiClient({
  baseURL:
    (process.env.NEXT_PUBLIC_API_URL || "https://api.infra-pro.com") +
    "/api/v1",
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  onAuthFailure: () => {
    clearAuth();
    if (typeof window !== "undefined") window.location.href = "/login";
  },
});

// ─── Backward-compatible request<T>() wrapper ─────────
// Domain files (auth.ts, products.ts, etc.) call request() with fetch-style API.
// This wrapper maps that API to the axios instance so domain files need no changes.
export async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const data = options.body
    ? JSON.parse(options.body as string)
    : undefined;
  const signal = options.signal as AbortSignal | undefined;
  const response = await apiClient.request<T>({ method, url: path, data, signal });
  return response.data;
}

// ─── Auth helpers (used by auth.ts) ───────────────────
export async function loginWithTokens(
  email: string,
  password: string
): Promise<LoginResponse> {
  const data = await request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setAccessToken(data.accessToken);
  setRefreshToken(data.refreshToken);
  if (typeof window !== "undefined")
    localStorage.setItem("user", JSON.stringify(data.user));
  return data;
}

export async function registerWithTokens(
  email: string,
  password: string,
  name?: string
): Promise<RegisterResponse> {
  const data = await request<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
  setAccessToken(data.accessToken);
  setRefreshToken(data.refreshToken);
  if (typeof window !== "undefined")
    localStorage.setItem("user", JSON.stringify(data.user));
  return data;
}

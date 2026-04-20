import { createApiClient, ApiError } from "@infrapro/api-client";

const CUSTOMER_KEYS = {
  access: "customerAccessToken",
  refresh: "customerRefreshToken",
  customer: "customer",
} as const;

export function getCustomerAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CUSTOMER_KEYS.access);
}

export function setCustomerAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(CUSTOMER_KEYS.access, token);
  else localStorage.removeItem(CUSTOMER_KEYS.access);
}

export function getCustomerRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CUSTOMER_KEYS.refresh);
}

export function setCustomerRefreshToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(CUSTOMER_KEYS.refresh, token);
  else localStorage.removeItem(CUSTOMER_KEYS.refresh);
}

export function clearCustomerTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CUSTOMER_KEYS.access);
  localStorage.removeItem(CUSTOMER_KEYS.refresh);
  localStorage.removeItem(CUSTOMER_KEYS.customer);
}

const apiClient = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api/v1",
  getAccessToken: getCustomerAccessToken,
  setAccessToken: setCustomerAccessToken,
  getRefreshToken: getCustomerRefreshToken,
  setRefreshToken: setCustomerRefreshToken,
  refreshEndpoint: "/customer/auth/refresh",
  onAuthFailure: () => {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },
});

export { apiClient, ApiError };

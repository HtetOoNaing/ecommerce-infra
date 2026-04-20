import {
  apiClient,
  ApiError,
  setCustomerAccessToken,
  setCustomerRefreshToken,
  clearCustomerTokens,
} from "./client";
import type { Customer, CustomerAuthResponse } from "@infrapro/shared-types";

export async function registerCustomer(data: {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}): Promise<CustomerAuthResponse> {
  const response = await apiClient.post<CustomerAuthResponse>(
    "/customer/auth/register",
    data
  );
  const { accessToken, refreshToken, customer } = response.data;
  setCustomerAccessToken(accessToken);
  setCustomerRefreshToken(refreshToken);
  setStoredCustomer(customer);
  return { customer, accessToken, refreshToken };
}

export async function loginCustomer(
  email: string,
  password: string
): Promise<CustomerAuthResponse> {
  const response = await apiClient.post<CustomerAuthResponse>(
    "/customer/auth/login",
    { email, password }
  );
  const { accessToken, refreshToken, customer } = response.data;
  setCustomerAccessToken(accessToken);
  setCustomerRefreshToken(refreshToken);
  setStoredCustomer(customer);
  return { customer, accessToken, refreshToken };
}

export async function logoutCustomer(): Promise<void> {
  try {
    await apiClient.post("/customer/auth/logout");
  } finally {
    clearCustomerAuth();
  }
}

export function clearCustomerAuth(): void {
  clearCustomerTokens();
}

export function getStoredCustomer(): Customer | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("customer");
  return stored ? (JSON.parse(stored) as Customer) : null;
}

export function setStoredCustomer(customer: Customer): void {
  localStorage.setItem("customer", JSON.stringify(customer));
}

export { ApiError };

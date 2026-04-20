import { apiClient, ApiError } from "./client";
import { setAccessToken, setRefreshToken } from "@infrapro/api-client";
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
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
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
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
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
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("customer");
}

export function getStoredCustomer(): Customer | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("customer");
  return stored ? JSON.parse(stored) : null;
}

export function setStoredCustomer(customer: Customer): void {
  localStorage.setItem("customer", JSON.stringify(customer));
}

export { ApiError };

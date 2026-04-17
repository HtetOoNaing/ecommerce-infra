import type {
  AuthUser,
  LoginResponse,
  RegisterResponse,
} from "../types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.infra-pro.com";
const API_BASE = `${API_URL}/api/v1`;

// ─── Token storage ───────────────────────────────────
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    if (typeof window !== "undefined") localStorage.setItem("accessToken", token);
  } else {
    if (typeof window !== "undefined") localStorage.removeItem("accessToken");
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") {
    accessToken = localStorage.getItem("accessToken");
  }
  return accessToken;
}

export function setRefreshToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("refreshToken", token);
  else localStorage.removeItem("refreshToken");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

// ─── Error class ─────────────────────────────────────
class ApiError extends Error {
  status: number;
  errors?: Array<{ message: string; path?: string[] }>;

  constructor(message: string, status: number, errors?: Array<{ message: string; path?: string[] }>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export { ApiError };

// ─── Fetch wrapper ───────────────────────────────────
async function tryRefresh(): Promise<boolean> {
  const rt = getRefreshToken();
  if (!rt) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export function clearAuth() {
  setAccessToken(null);
  setRefreshToken(null);
  if (typeof window !== "undefined") localStorage.removeItem("user");
}

export async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (res.status === 401 && token) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${getAccessToken()}`;
      const retry = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        cache: "no-store",
      });
      if (retry.ok) return retry.json();
    }
    clearAuth();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new ApiError("Session expired", 401);
  }

  if (!res.ok) {
    let message = "Something went wrong";
    let errors;
    try {
      const data = await res.json();
      message = data.message || message;
      errors = data.errors;
    } catch {
      // ignore
    }
    throw new ApiError(message, res.status, errors);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
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
  if (typeof window !== "undefined") localStorage.setItem("user", JSON.stringify(data.user));
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
  if (typeof window !== "undefined") localStorage.setItem("user", JSON.stringify(data.user));
  return data;
}

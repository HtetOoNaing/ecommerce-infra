import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import axiosRetry from "axios-retry";

// ─── ApiError ────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  errors?: Array<{ message: string; path?: string[] }>;

  constructor(
    message: string,
    status: number,
    errors?: Array<{ message: string; path?: string[] }>
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

// ─── Factory config ───────────────────────────────────────────────────────────

export interface CreateApiClientConfig {
  baseURL: string;
  timeout?: number;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  onAuthFailure?: () => void;
  refreshEndpoint?: string;
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createApiClient(config: CreateApiClientConfig): AxiosInstance {
  const {
    baseURL,
    timeout = 15_000,
    getAccessToken,
    getRefreshToken,
    setAccessToken,
    setRefreshToken,
    onAuthFailure,
    refreshEndpoint = "/auth/refresh",
  } = config;

  const instance = axios.create({
    baseURL,
    timeout,
    headers: { "Content-Type": "application/json" },
    withCredentials: false,
  });

  // axios-retry: 5xx and network errors only — never 4xx
  axiosRetry(instance, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) =>
      axiosRetry.isNetworkError(error) ||
      (error.response !== undefined && error.response.status >= 500),
  });

  // Request interceptor: inject Authorization header
  instance.interceptors.request.use(
    (reqConfig: InternalAxiosRequestConfig) => {
      const token = getAccessToken();
      if (token) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
      }
      return reqConfig;
    },
    (error: unknown) => Promise.reject(toApiError(error as AxiosError))
  );

  // Refresh token queue: prevents concurrent /auth/refresh calls
  let refreshPromise: Promise<string> | null = null;

  // Response interceptor: 401 refresh + AxiosError → ApiError
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          if (!refreshPromise) {
            refreshPromise = (async (): Promise<string> => {
              const rt = getRefreshToken();
              if (!rt) throw new Error("No refresh token");

              const { data } = await axios.post<{
                accessToken: string;
                refreshToken: string;
              }>(`${baseURL}${refreshEndpoint}`, { refreshToken: rt });

              setAccessToken(data.accessToken);
              setRefreshToken(data.refreshToken);
              return data.accessToken;
            })().finally(() => {
              refreshPromise = null;
            });
          }

          const newToken = await refreshPromise;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);
        } catch {
          onAuthFailure?.();
          throw toApiError(error);
        }
      }

      throw toApiError(error);
    }
  );

  return instance;
}

// ─── Error normalizer ─────────────────────────────────────────────────────────

function toApiError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 0;
  const data = error.response?.data as
    | { message?: string; errors?: Array<{ message: string; path?: string[] }> }
    | undefined;
  const message = data?.message ?? error.message ?? "Something went wrong";
  return new ApiError(message, status, data?.errors);
}

// ─── Default localStorage token helpers ──────────────────────────────────────

const ADMIN_TOKEN_KEYS = {
  access: "accessToken",
  refresh: "refreshToken",
  user: "user",
} as const;

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEYS.access);
}

export function setAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(ADMIN_TOKEN_KEYS.access, token);
  else localStorage.removeItem(ADMIN_TOKEN_KEYS.access);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEYS.refresh);
}

export function setRefreshToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(ADMIN_TOKEN_KEYS.refresh, token);
  else localStorage.removeItem(ADMIN_TOKEN_KEYS.refresh);
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_TOKEN_KEYS.access);
  localStorage.removeItem(ADMIN_TOKEN_KEYS.refresh);
  localStorage.removeItem(ADMIN_TOKEN_KEYS.user);
}

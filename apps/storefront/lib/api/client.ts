import {
  createApiClient,
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  clearAuth,
  ApiError,
} from "@infrapro/api-client";

const apiClient = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api/v1",
  getAccessToken: getAccessToken,
  setAccessToken: setAccessToken,
  getRefreshToken: getRefreshToken,
  setRefreshToken: setRefreshToken,
  clearAuth: clearAuth,
  onAuthFailure: () => {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },
});

export { apiClient, ApiError };

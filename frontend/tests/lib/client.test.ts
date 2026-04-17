import { describe, it, expect, beforeEach } from "vitest";
import { getProducts, login, getAccessToken, ApiError } from "@/lib/api";
import { mockProducts } from "../mocks/handlers";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";

const API = "https://api.infra-pro.com/api/v1";

beforeEach(() => {
  localStorage.clear();
});

// ─── Token Management ────────────────────────────────
describe("token storage", () => {
  it("getAccessToken returns null when no token set", () => {
    expect(getAccessToken()).toBeNull();
  });

  it("getAccessToken returns token after login", async () => {
    await login("admin@test.com", "Test1234!");
    expect(getAccessToken()).toBe("mock-access-token");
  });
});

// ─── Token Refresh ──────────────────────────────────
describe("token refresh", () => {
  it("retries request after 401 with valid refresh token", async () => {
    await login("admin@test.com", "Test1234!");

    let callCount = 0;
    server.use(
      http.get(`${API}/products`, () => {
        callCount++;
        if (callCount === 1) {
          return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        return HttpResponse.json(mockProducts);
      })
    );

    const products = await getProducts();
    expect(products).toHaveLength(2);
    expect(callCount).toBe(2);
  });
});

// ─── Error Handling ─────────────────────────────────
describe("server error handling", () => {
  it("throws ApiError with message on 500", async () => {
    server.use(
      http.get(`${API}/products`, () => {
        return HttpResponse.json({ message: "Internal error" }, { status: 500 });
      })
    );

    await expect(getProducts()).rejects.toThrow(ApiError);
    await expect(getProducts()).rejects.toThrow("Internal error");
  });

  it("throws ApiError with correct status code", async () => {
    server.use(
      http.get(`${API}/products`, () => {
        return HttpResponse.json({ message: "Forbidden" }, { status: 403 });
      })
    );

    try {
      await getProducts();
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(403);
    }
  });
});

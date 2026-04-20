import { describe, it, expect, beforeEach } from "vitest";
import {
  login,
  register,
  forgotPassword,
  logout,
  getAccessToken,
  ApiError,
} from "@/lib/api";

beforeEach(() => {
  localStorage.clear();
});

// ─── Auth API ───────────────────────────────────────
describe("login", () => {
  it("stores tokens and returns user on success", async () => {
    const result = await login("admin@test.com", "Test1234!");
    expect(result.user.email).toBe("admin@test.com");
    expect(result.accessToken).toBe("mock-access-token");
    expect(getAccessToken()).toBe("mock-access-token");
    expect(localStorage.getItem("user")).toContain("admin@test.com");
  });

  it("throws ApiError on invalid credentials", async () => {
    await expect(login("bad@test.com", "wrong")).rejects.toThrow(ApiError);
    await expect(login("bad@test.com", "wrong")).rejects.toThrow("Invalid credentials");
  });
});

describe("register", () => {
  it("returns user and stores tokens", async () => {
    const result = await register("new@test.com", "Test1234!", "New User");
    expect(result.user.email).toBe("new@test.com");
    expect(getAccessToken()).toBe("mock-access-token");
  });
});

describe("forgotPassword", () => {
  it("returns success message", async () => {
    const result = await forgotPassword("admin@test.com");
    expect(result.message).toBe("Reset link sent");
  });
});

describe("logout", () => {
  it("clears stored tokens", async () => {
    await login("admin@test.com", "Test1234!");
    expect(getAccessToken()).toBeTruthy();
    await logout();
    expect(localStorage.getItem("accessToken")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });
});

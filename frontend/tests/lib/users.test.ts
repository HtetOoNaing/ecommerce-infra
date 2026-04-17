import { describe, it, expect, beforeEach } from "vitest";
import { getUsers, login, getAccessToken } from "@/lib/api";

beforeEach(() => {
  localStorage.clear();
});

// ─── Users API ──────────────────────────────────────
describe("getUsers", () => {
  it("returns list of users when authenticated", async () => {
    // Need auth first
    await login("admin@test.com", "Test1234!");
    expect(getAccessToken()).toBeTruthy();

    const users = await getUsers();
    expect(users).toHaveLength(2);
    expect(users[0].email).toBe("admin@test.com");
  });
});

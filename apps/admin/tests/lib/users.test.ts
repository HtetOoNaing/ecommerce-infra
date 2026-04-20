import { describe, it, expect, beforeEach } from "vitest";
import { getUsers, login, getAccessToken } from "@/lib/api";

beforeEach(() => {
  localStorage.clear();
});

// ─── Users API ──────────────────────────────────────
describe("getUsers", () => {
  it("returns paginated list of users when authenticated", async () => {
    // Need auth first
    await login("admin@test.com", "Test1234!");
    expect(getAccessToken()).toBeTruthy();

    const response = await getUsers();
    expect(response.data).toHaveLength(2);
    expect(response.data[0].email).toBe("admin@test.com");
    expect(response.total).toBe(2);
  });
});

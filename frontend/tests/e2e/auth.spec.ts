import { test, expect } from "@playwright/test";

/**
 * E2E Auth Flow Tests
 * Critical user journey: Login → Dashboard → Logout
 */

test.describe("Authentication Flow", () => {
  test("user can login and access dashboard", async ({ page }) => {
    // Navigate to login
    await page.goto("/login");
    await expect(page).toHaveTitle(/InfraPro/);

    // Fill login form
    await page.getByLabel("Email").fill("admin@test.com");
    await page.getByLabel("Password").fill("Test1234!");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("Welcome back")).toBeVisible();
  });

  test("user can logout", async ({ page }) => {
    // Login first
    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@test.com");
    await page.getByLabel("Password").fill("Test1234!");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Click logout
    await page.getByRole("button", { name: "Log out" }).click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user is redirected to login", async ({ page }) => {
    // Try to access dashboard directly
    await page.goto("/dashboard");

    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("wrong@test.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();

    // Error toast should appear
    await expect(page.getByText(/Invalid credentials|error/i)).toBeVisible();

    // Should stay on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test("user can register new account", async ({ page }) => {
    await page.goto("/register");

    await page.getByLabel("Name").fill("Test User");
    await page.getByLabel("Email").fill(`test${Date.now()}@example.com`);
    await page.getByLabel("Password").fill("TestPass123!");
    await page.getByRole("button", { name: "Create account" }).click();

    // Should redirect to dashboard after registration
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/Welcome|Account created/i)).toBeVisible();
  });
});

test.describe("Forgot Password Flow", () => {
  test("user can request password reset", async ({ page }) => {
    await page.goto("/forgot-password");

    await page.getByLabel("Email").fill("admin@test.com");
    await page.getByRole("button", { name: "Send reset link" }).click();

    // Success message should appear
    await expect(page.getByText(/Check your email|sent/i)).toBeVisible();
  });
});

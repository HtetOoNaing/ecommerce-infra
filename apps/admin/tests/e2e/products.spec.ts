import { test, expect } from "@playwright/test";

/**
 * E2E Products Flow Tests
 * Critical user journey: Create, Read, Update, Delete products
 */

test.describe("Products Management", () => {
  // Helper to login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("admin@test.com");
    await page.getByLabel("Password").fill("Test1234!");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to products
    await page.getByRole("link", { name: /Products/i }).click();
    await expect(page).toHaveURL(/\/dashboard\/products/);
  });

  test("can view products list", async ({ page }) => {
    // Table or product list should be visible
    await expect(
      page.getByRole("table").or(page.getByText(/No products|Product/))
    ).toBeVisible();
  });

  test("can create a new product", async ({ page }) => {
    const uniqueSku = `TEST-${Date.now()}`;

    // Click add product button
    await page.getByRole("button", { name: /Add Product|New Product/i }).click();

    // Fill product form
    await page.getByLabel("Name").fill("E2E Test Product");
    await page.getByLabel("SKU").fill(uniqueSku);
    await page.getByLabel("Price").fill("99.99");
    await page.getByLabel("Stock").fill("100");

    // Save product
    await page.getByRole("button", { name: /Save|Create/i }).click();

    // Should see success toast
    await expect(page.getByText(/created|success/i)).toBeVisible();

    // Product should appear in list
    await expect(page.getByText("E2E Test Product")).toBeVisible();
  });

  test("can edit a product", async ({ page }) => {
    // Find first product and click edit
    const editButton = page.getByRole("button", { name: /Edit/i }).first();
    await editButton.click();

    // Modify product name
    await page.getByLabel("Name").fill("Updated E2E Product");
    await page.getByRole("button", { name: /Save|Update/i }).click();

    // Should see success toast
    await expect(page.getByText(/updated|success/i)).toBeVisible();
  });

  test("can search products", async ({ page }) => {
    const searchBox = page.getByPlaceholder(/Search/i);
    await searchBox.fill("MacBook");
    await searchBox.press("Enter");

    // Wait for search results
    await page.waitForTimeout(500);

    // Should show filtered results or empty state
    await expect(
      page.getByText(/MacBook|No products found/i)
    ).toBeVisible();
  });

  test("can delete a product with confirmation", async ({ page }) => {
    // Find first product and click delete
    const deleteButton = page.getByRole("button", { name: /Delete/i }).first();
    await deleteButton.click();

    // Confirm modal should appear
    await expect(page.getByText(/Confirm|Are you sure/i)).toBeVisible();

    // Click confirm
    await page.getByRole("button", { name: /Delete|Confirm/i }).nth(1).click();

    // Should see success toast
    await expect(page.getByText(/deleted|success/i)).toBeVisible();
  });

  test("pagination works", async ({ page }) => {
    // Look for pagination controls
    const pagination = page.getByRole("navigation", { name: /pagination/i })
      .or(page.getByText(/Page \d+ of/));

    // If pagination exists, test it
    if (await pagination.isVisible().catch(() => false)) {
      const nextButton = page.getByRole("button", { name: /Next/i });
      if (await nextButton.isEnabled().catch(() => false)) {
        await nextButton.click();
        await page.waitForTimeout(500);
        await expect(page).toHaveURL(/page=2|offset=/);
      }
    }
  });
});

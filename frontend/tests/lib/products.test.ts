import { describe, it, expect, beforeEach } from "vitest";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  login,
  ApiError,
} from "@/lib/api";

beforeEach(() => {
  localStorage.clear();
});

// ─── Products API ───────────────────────────────────
describe("getProducts", () => {
  it("returns paginated list of products", async () => {
    const response = await getProducts();
    expect(response.data).toHaveLength(2);
    expect(response.data[0].name).toBe("MacBook Pro");
    expect(response.total).toBe(2);
    expect(response.page).toBe(1);
  });
});

describe("getProduct", () => {
  it("returns single product by id", async () => {
    const product = await getProduct(1);
    expect(product.name).toBe("MacBook Pro");
    expect(product.sku).toBe("MBP-16-2026");
  });

  it("throws on not found", async () => {
    await expect(getProduct(999)).rejects.toThrow(ApiError);
  });
});

describe("createProduct", () => {
  it("creates and returns product when authenticated", async () => {
    await login("admin@test.com", "Test1234!");
    const product = await createProduct({
      name: "Test Product",
      price: 49.99,
      stock: 10,
      sku: "TP-001",
    });
    expect(product.name).toBe("Test Product");
    expect(product.id).toBe(3);
  });
});

describe("updateProduct", () => {
  it("updates and returns product when authenticated", async () => {
    await login("admin@test.com", "Test1234!");
    const product = await updateProduct(1, { name: "Updated MacBook" });
    expect(product.name).toBe("Updated MacBook");
  });
});

describe("deleteProduct", () => {
  it("deletes product without error when authenticated", async () => {
    await login("admin@test.com", "Test1234!");
    await expect(deleteProduct(1)).resolves.toBeUndefined();
  });
});

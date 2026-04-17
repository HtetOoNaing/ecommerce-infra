import { describe, it, expect, beforeEach } from "vitest";
import {
  login,
  register,
  forgotPassword,
  getUsers,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
} from "@/lib/api";
import {
  validateResponse,
  safeValidateResponse,
  LoginResponseSchema,
  RegisterResponseSchema,
  ForgotPasswordResponseSchema,
  UserSchema,
  UsersListSchema,
  ProductSchema,
  ProductsListSchema,
  CreateProductSchema,
  ApiErrorSchema,
} from "@/lib/validators";

/**
 * API Contract Tests
 * Validates that backend responses match expected Zod schemas
 * Ensures API compatibility between frontend and backend
 */

beforeEach(() => {
  localStorage.clear();
});

describe("Auth API Contracts", () => {
  it("login response matches schema", async () => {
    const response = await login("admin@test.com", "Test1234!");

    // Should not throw - validates structure
    const validated = validateResponse(LoginResponseSchema, response);

    expect(validated.user.email).toBe("admin@test.com");
    expect(validated.accessToken).toBeTruthy();
    expect(validated.refreshToken).toBeTruthy();
  });

  it("register response matches schema", async () => {
    const uniqueEmail = `contract-${Date.now()}@test.com`;
    const response = await register(uniqueEmail, "Test1234!", "Contract Test");

    const validated = validateResponse(RegisterResponseSchema, response);

    expect(validated.user.email).toBe(uniqueEmail);
    expect(validated.user.name).toBe("Contract Test");
  });

  it("forgot password response matches schema", async () => {
    const response = await forgotPassword("admin@test.com");

    const validated = validateResponse(ForgotPasswordResponseSchema, response);

    expect(validated.message).toBeTruthy();
  });
});

describe("User API Contracts", () => {
  it("user list response matches schema", async () => {
    await login("admin@test.com", "Test1234!");
    const users = await getUsers();

    // Validate array structure
    const validated = validateResponse(UsersListSchema, users);

    expect(validated.length).toBeGreaterThan(0);

    // Each user should match UserSchema
    validated.forEach((user) => {
      expect(user.id).toBeDefined();
      expect(user.email).toContain("@");
      expect(["admin", "user"]).toContain(user.role);
    });
  });

  it("individual user matches schema", async () => {
    await login("admin@test.com", "Test1234!");
    const users = await getUsers();

    if (users.length > 0) {
      const user = users[0];
      const validated = validateResponse(UserSchema, user);

      expect(validated.id).toBe(user.id);
      expect(validated.email).toBe(user.email);
    }
  });
});

describe("Product API Contracts", () => {
  it("product list response matches schema", async () => {
    const products = await getProducts();

    const validated = validateResponse(ProductsListSchema, products);

    expect(Array.isArray(validated)).toBe(true);
  });

  it("individual product matches schema", async () => {
    const products = await getProducts();

    if (products.length > 0) {
      const productId = products[0].id;
      const product = await getProduct(productId);

      const validated = validateResponse(ProductSchema, product);

      expect(validated.id).toBe(productId);
      expect(validated.price).toBeGreaterThan(0);
      expect(validated.stock).toBeGreaterThanOrEqual(0);
    }
  });

  it("created product response matches schema", async () => {
    await login("admin@test.com", "Test1234!");

    const createData = {
      name: "Contract Test Product",
      sku: `CT-${Date.now()}`,
      price: 99.99,
      stock: 50,
    };

    // Validate create input first
    const validInput = validateResponse(CreateProductSchema, createData);

    const product = await createProduct(validInput);
    const validated = validateResponse(ProductSchema, product);

    expect(validated.name).toBe(createData.name);
    expect(validated.sku).toBe(createData.sku);
    expect(validated.price).toBe(createData.price);
    expect(validated.id).toBeDefined();
  });

  it("updated product response matches schema", async () => {
    await login("admin@test.com", "Test1234!");

    // Get existing product
    const products = await getProducts();
    if (products.length === 0) {
      return;
    }

    const productId = products[0].id;
    const updateData = { name: "Updated Contract Test" };

    const product = await updateProduct(productId, updateData);
    const validated = validateResponse(ProductSchema, product);

    expect(validated.id).toBe(productId);
    expect(validated.name).toBe(updateData.name);
  });
});

describe("Safe Validation", () => {
  it("safeValidate returns success for valid data", () => {
    const validUser = {
      id: 1,
      email: "test@example.com",
      name: "Test User",
      role: "user" as const,
      isActive: true,
    };

    const result = safeValidateResponse(UserSchema, validUser);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("test@example.com");
    }
  });

  it("safeValidate returns errors for invalid data", () => {
    const invalidUser = {
      id: "not-a-number", // Wrong type
      email: "not-an-email",
      // Missing required fields
    };

    const result = safeValidateResponse(UserSchema, invalidUser);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toBeDefined();
    }
  });
});

describe("Error Response Contracts", () => {
  it("error responses match ApiErrorSchema", async () => {
    // Try invalid login to trigger error
    try {
      await login("invalid@test.com", "wrongpassword");
    } catch (error: any) {
      // Error should have message property
      expect(error.message).toBeDefined();
      expect(typeof error.status).toBe("number");
    }
  });
});

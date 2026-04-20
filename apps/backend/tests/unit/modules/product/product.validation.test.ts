import { createProductSchema, updateProductSchema } from "@/modules/product/product.validation";

describe("Product Validation", () => {
  describe("createProductSchema", () => {
    it("should pass with valid data", () => {
      const result = createProductSchema.safeParse({
        name: "MacBook Pro",
        description: "16 inch laptop",
        price: 2499.99,
        stock: 50,
        sku: "MBP-16-2026",
      });

      expect(result.success).toBe(true);
    });

    it("should fail with empty name", () => {
      const result = createProductSchema.safeParse({
        name: "",
        price: 100,
        stock: 10,
        sku: "ABC-123",
      });

      expect(result.success).toBe(false);
    });

    it("should fail with negative price", () => {
      const result = createProductSchema.safeParse({
        name: "Test Product",
        price: -1,
        stock: 10,
        sku: "ABC-123",
      });

      expect(result.success).toBe(false);
    });

    it("should fail with negative stock", () => {
      const result = createProductSchema.safeParse({
        name: "Test Product",
        price: 100,
        stock: -5,
        sku: "ABC-123",
      });

      expect(result.success).toBe(false);
    });

    it("should fail with invalid SKU characters", () => {
      const result = createProductSchema.safeParse({
        name: "Test Product",
        price: 100,
        stock: 10,
        sku: "ABC 123!@#",
      });

      expect(result.success).toBe(false);
    });

    it("should allow optional description", () => {
      const result = createProductSchema.safeParse({
        name: "Test Product",
        price: 100,
        stock: 10,
        sku: "ABC-123",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("updateProductSchema", () => {
    it("should pass with partial data", () => {
      const result = updateProductSchema.safeParse({
        price: 199.99,
      });

      expect(result.success).toBe(true);
    });

    it("should pass with empty object (no updates)", () => {
      const result = updateProductSchema.safeParse({});

      expect(result.success).toBe(true);
    });

    it("should allow isActive toggle", () => {
      const result = updateProductSchema.safeParse({
        isActive: false,
      });

      expect(result.success).toBe(true);
    });
  });
});

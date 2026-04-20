import { createUserSchema } from "@/modules/user/user.validation";

describe("User Validation Schemas", () => {
  describe("createUserSchema", () => {
    it("should pass with all valid fields", () => {
      const result = createUserSchema.safeParse({
        email: "admin@example.com",
        password: "secureP@ss1",
        name: "Admin User",
        role: "admin",
        isVerified: true,
      });
      expect(result.success).toBe(true);
    });

    it("should pass with only required fields (uses defaults)", () => {
      const result = createUserSchema.safeParse({
        email: "user@example.com",
        password: "secureP@ss1",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe("user");
        expect(result.data.isVerified).toBe(false);
      }
    });

    it("should fail with invalid email", () => {
      const result = createUserSchema.safeParse({
        email: "not-valid",
        password: "secureP@ss1",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with missing email", () => {
      const result = createUserSchema.safeParse({
        password: "secureP@ss1",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with password shorter than 8 chars", () => {
      const result = createUserSchema.safeParse({
        email: "user@example.com",
        password: "short",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with password longer than 128 chars", () => {
      const result = createUserSchema.safeParse({
        email: "user@example.com",
        password: "a".repeat(129),
      });
      expect(result.success).toBe(false);
    });

    it("should fail with missing password", () => {
      const result = createUserSchema.safeParse({
        email: "user@example.com",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with invalid role", () => {
      const result = createUserSchema.safeParse({
        email: "user@example.com",
        password: "secureP@ss1",
        role: "superadmin",
      });
      expect(result.success).toBe(false);
    });

    it("should accept admin role", () => {
      const result = createUserSchema.safeParse({
        email: "admin@example.com",
        password: "secureP@ss1",
        role: "admin",
      });
      expect(result.success).toBe(true);
    });

    it("should allow optional name", () => {
      const result = createUserSchema.safeParse({
        email: "user@example.com",
        password: "secureP@ss1",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBeUndefined();
      }
    });

    it("should allow nullable verificationToken", () => {
      const result = createUserSchema.safeParse({
        email: "user@example.com",
        password: "secureP@ss1",
        verificationToken: null,
      });
      expect(result.success).toBe(true);
    });

    it("should allow string verificationToken", () => {
      const result = createUserSchema.safeParse({
        email: "user@example.com",
        password: "secureP@ss1",
        verificationToken: "some-token",
      });
      expect(result.success).toBe(true);
    });
  });
});

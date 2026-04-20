import {
  registerSchema,
  loginSchema,
  refreshSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/modules/auth/auth.validation";

describe("Auth Validation Schemas", () => {
  // ─── registerSchema ───────────────────────────────────
  describe("registerSchema", () => {
    it("should pass with valid email, password, name, and role", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "secureP@ss1",
        name: "John",
        role: "user",
      });
      expect(result.success).toBe(true);
    });

    it("should pass with only required fields", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "secureP@ss1",
      });
      expect(result.success).toBe(true);
    });

    it("should fail with invalid email", () => {
      const result = registerSchema.safeParse({
        email: "not-an-email",
        password: "secureP@ss1",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with missing email", () => {
      const result = registerSchema.safeParse({
        password: "secureP@ss1",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with password shorter than 8 chars", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "short",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with password longer than 128 chars", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "a".repeat(129),
      });
      expect(result.success).toBe(false);
    });

    it("should fail with missing password", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with invalid role", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "secureP@ss1",
        role: "superadmin",
      });
      expect(result.success).toBe(false);
    });

    it("should accept admin role", () => {
      const result = registerSchema.safeParse({
        email: "admin@example.com",
        password: "secureP@ss1",
        role: "admin",
      });
      expect(result.success).toBe(true);
    });

    it("should allow optional name", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "secureP@ss1",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBeUndefined();
      }
    });

    it("should fail with empty string name", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "secureP@ss1",
        name: "",
      });
      expect(result.success).toBe(false);
    });
  });

  // ─── loginSchema ──────────────────────────────────────
  describe("loginSchema", () => {
    it("should pass with valid email and password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "myPassword",
      });
      expect(result.success).toBe(true);
    });

    it("should fail with invalid email", () => {
      const result = loginSchema.safeParse({
        email: "bad",
        password: "myPassword",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with missing password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with empty password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with missing email", () => {
      const result = loginSchema.safeParse({
        password: "myPassword",
      });
      expect(result.success).toBe(false);
    });
  });

  // ─── refreshSchema ────────────────────────────────────
  describe("refreshSchema", () => {
    it("should pass with valid refreshToken", () => {
      const result = refreshSchema.safeParse({
        refreshToken: "some-jwt-token-value",
      });
      expect(result.success).toBe(true);
    });

    it("should fail with missing refreshToken", () => {
      const result = refreshSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should fail with empty refreshToken", () => {
      const result = refreshSchema.safeParse({ refreshToken: "" });
      expect(result.success).toBe(false);
    });
  });

  // ─── verifyEmailSchema ────────────────────────────────
  describe("verifyEmailSchema", () => {
    it("should pass with valid token", () => {
      const result = verifyEmailSchema.safeParse({ token: "abc123" });
      expect(result.success).toBe(true);
    });

    it("should fail with missing token", () => {
      const result = verifyEmailSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("should fail with empty token", () => {
      const result = verifyEmailSchema.safeParse({ token: "" });
      expect(result.success).toBe(false);
    });
  });

  // ─── forgotPasswordSchema ─────────────────────────────
  describe("forgotPasswordSchema", () => {
    it("should pass with valid email", () => {
      const result = forgotPasswordSchema.safeParse({
        email: "user@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("should fail with invalid email", () => {
      const result = forgotPasswordSchema.safeParse({ email: "nope" });
      expect(result.success).toBe(false);
    });

    it("should fail with missing email", () => {
      const result = forgotPasswordSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  // ─── resetPasswordSchema ──────────────────────────────
  describe("resetPasswordSchema", () => {
    it("should pass with valid token and newPassword", () => {
      const result = resetPasswordSchema.safeParse({
        token: "reset-token-abc",
        newPassword: "newSecure1!",
      });
      expect(result.success).toBe(true);
    });

    it("should fail with missing token", () => {
      const result = resetPasswordSchema.safeParse({
        newPassword: "newSecure1!",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with missing newPassword", () => {
      const result = resetPasswordSchema.safeParse({
        token: "reset-token-abc",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with newPassword shorter than 8 chars", () => {
      const result = resetPasswordSchema.safeParse({
        token: "reset-token-abc",
        newPassword: "short",
      });
      expect(result.success).toBe(false);
    });

    it("should fail with newPassword longer than 128 chars", () => {
      const result = resetPasswordSchema.safeParse({
        token: "reset-token-abc",
        newPassword: "a".repeat(129),
      });
      expect(result.success).toBe(false);
    });

    it("should fail with empty token", () => {
      const result = resetPasswordSchema.safeParse({
        token: "",
        newPassword: "newSecure1!",
      });
      expect(result.success).toBe(false);
    });
  });
});

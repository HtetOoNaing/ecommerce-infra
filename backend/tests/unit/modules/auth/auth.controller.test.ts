const mockRegister = jest.fn();
const mockLogin = jest.fn();
const mockRefresh = jest.fn();
const mockLogout = jest.fn();
const mockVerifyEmail = jest.fn();
const mockForgotPassword = jest.fn();
const mockResetPassword = jest.fn();

jest.mock("@/modules/auth/auth.service", () => ({
  AuthService: jest.fn().mockImplementation(() => ({
    register: mockRegister,
    login: mockLogin,
    refresh: mockRefresh,
    logout: mockLogout,
    verifyEmail: mockVerifyEmail,
    forgotPassword: mockForgotPassword,
    resetPassword: mockResetPassword,
  })),
}));

import express from "express";
import request from "supertest";
import { AuthController } from "@/modules/auth/auth.controller";

function createApp() {
  const app = express();
  app.use(express.json());

  // Attach requestId like the real middleware does
  app.use((req: any, _res, next) => {
    req.requestId = "test-req-id";
    next();
  });

  const ctrl = new AuthController();

  app.post("/register", ctrl.register.bind(ctrl));
  app.post("/login", ctrl.login.bind(ctrl));
  app.post("/refresh", ctrl.refresh.bind(ctrl));
  app.post("/logout", (req: any, _res, next) => {
    req.user = { id: 1, sessionId: "s1" };
    next();
  }, ctrl.logout.bind(ctrl));
  app.post("/verify-email", ctrl.verifyEmail.bind(ctrl));
  app.post("/forgot-password", ctrl.forgotPassword.bind(ctrl));
  app.post("/reset-password", ctrl.resetPassword.bind(ctrl));

  app.use((err: any, _req: any, res: any, _next: any) => {
    res.status(err.status || 500).json({ message: err.message });
  });

  return app;
}

describe("AuthController", () => {
  const app = createApp();

  describe("POST /register", () => {
    it("should return 200 with tokens", async () => {
      mockRegister.mockResolvedValue({
        user: { id: 1, email: "a@b.com" },
        accessToken: "at",
        refreshToken: "rt",
      });

      const res = await request(app)
        .post("/register")
        .send({ email: "a@b.com", password: "pass" });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBe("at");
    });
  });

  describe("POST /login", () => {
    it("should return 200 with user and tokens", async () => {
      mockLogin.mockResolvedValue({
        user: { id: 1, email: "a@b.com", role: "user" },
        accessToken: "at",
        refreshToken: "rt",
      });

      const res = await request(app)
        .post("/login")
        .send({ email: "a@b.com", password: "pass" });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe("a@b.com");
    });

    it("should return 500 for invalid credentials", async () => {
      mockLogin.mockRejectedValue(
        new Error("Invalid credentials")
      );

      const res = await request(app)
        .post("/login")
        .send({ email: "bad@b.com", password: "wrong" });

      expect(res.status).toBe(500);
    });
  });

  describe("POST /refresh", () => {
    it("should return new tokens", async () => {
      mockRefresh.mockResolvedValue({
        accessToken: "new-at",
        refreshToken: "new-rt",
      });

      const res = await request(app)
        .post("/refresh")
        .send({ refreshToken: "old-rt" });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBe("new-at");
    });
  });

  describe("POST /logout", () => {
    it("should return 200 with success message", async () => {
      mockLogout.mockResolvedValue(undefined);

      const res = await request(app).post("/logout");

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Logged out successfully");
    });
  });

  describe("POST /verify-email", () => {
    it("should return verification success message", async () => {
      mockVerifyEmail.mockResolvedValue({
        message: "Email verified successfully",
      });

      const res = await request(app)
        .post("/verify-email")
        .send({ token: "verify-token" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Email verified successfully");
    });
  });

  describe("POST /forgot-password", () => {
    it("should return generic message regardless of email existence", async () => {
      mockForgotPassword.mockResolvedValue(undefined);

      const res = await request(app)
        .post("/forgot-password")
        .send({ email: "test@test.com" });

      expect(res.status).toBe(200);
    });
  });

  describe("POST /reset-password", () => {
    it("should return success on valid reset", async () => {
      mockResetPassword.mockResolvedValue({
        message: "Password reset successful",
      });

      const res = await request(app)
        .post("/reset-password")
        .send({ token: "reset-token", newPassword: "newPass123" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Password reset successful");
    });
  });
});

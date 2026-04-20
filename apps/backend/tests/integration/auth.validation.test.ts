import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import { validate, validateQuery } from "@/middlewares/validate.middleware";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/modules/auth/auth.validation";

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.post("/register", validate(registerSchema), (_req: Request, res: Response) => {
    res.json({ ok: true });
  });
  app.post("/login", validate(loginSchema), (_req: Request, res: Response) => {
    res.json({ ok: true });
  });
  app.post("/refresh", validate(refreshSchema), (_req: Request, res: Response) => {
    res.json({ ok: true });
  });
  app.get("/verify-email", validateQuery(verifyEmailSchema), (_req: Request, res: Response) => {
    res.json({ ok: true });
  });
  app.post("/forgot-password", validate(forgotPasswordSchema), (_req: Request, res: Response) => {
    res.json({ ok: true });
  });
  app.post("/reset-password", validate(resetPasswordSchema), (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  return app;
}

describe("Auth Validation — Integration", () => {
  const app = createTestApp();

  // ─── POST /register ───────────────────────────────────
  describe("POST /register", () => {
    it("should return 200 with valid body", async () => {
      const res = await request(app)
        .post("/register")
        .send({ email: "a@b.com", password: "longpassword" });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    it("should return 400 with invalid email", async () => {
      const res = await request(app)
        .post("/register")
        .send({ email: "bad", password: "longpassword" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation error");
    });

    it("should return 400 with short password", async () => {
      const res = await request(app)
        .post("/register")
        .send({ email: "a@b.com", password: "short" });
      expect(res.status).toBe(400);
    });

    it("should return 400 with empty body", async () => {
      const res = await request(app).post("/register").send({});
      expect(res.status).toBe(400);
    });

    it("should return 400 with invalid role", async () => {
      const res = await request(app)
        .post("/register")
        .send({ email: "a@b.com", password: "longpassword", role: "superadmin" });
      expect(res.status).toBe(400);
    });
  });

  // ─── POST /login ──────────────────────────────────────
  describe("POST /login", () => {
    it("should return 200 with valid body", async () => {
      const res = await request(app)
        .post("/login")
        .send({ email: "a@b.com", password: "myPassword" });
      expect(res.status).toBe(200);
    });

    it("should return 400 with invalid email", async () => {
      const res = await request(app)
        .post("/login")
        .send({ email: "bad", password: "myPassword" });
      expect(res.status).toBe(400);
    });

    it("should return 400 with empty password", async () => {
      const res = await request(app)
        .post("/login")
        .send({ email: "a@b.com", password: "" });
      expect(res.status).toBe(400);
    });

    it("should return 400 with missing fields", async () => {
      const res = await request(app).post("/login").send({});
      expect(res.status).toBe(400);
    });
  });

  // ─── POST /refresh ────────────────────────────────────
  describe("POST /refresh", () => {
    it("should return 200 with valid refreshToken", async () => {
      const res = await request(app)
        .post("/refresh")
        .send({ refreshToken: "some-token" });
      expect(res.status).toBe(200);
    });

    it("should return 400 with missing refreshToken", async () => {
      const res = await request(app).post("/refresh").send({});
      expect(res.status).toBe(400);
    });

    it("should return 400 with empty refreshToken", async () => {
      const res = await request(app)
        .post("/refresh")
        .send({ refreshToken: "" });
      expect(res.status).toBe(400);
    });
  });

  // ─── GET /verify-email ────────────────────────────────
  describe("GET /verify-email", () => {
    it("should return 200 with valid token query param", async () => {
      const res = await request(app).get("/verify-email?token=abc123");
      expect(res.status).toBe(200);
    });

    it("should return 400 with missing token", async () => {
      const res = await request(app).get("/verify-email");
      expect(res.status).toBe(400);
    });

    it("should return 400 with empty token", async () => {
      const res = await request(app).get("/verify-email?token=");
      expect(res.status).toBe(400);
    });
  });

  // ─── POST /forgot-password ────────────────────────────
  describe("POST /forgot-password", () => {
    it("should return 200 with valid email", async () => {
      const res = await request(app)
        .post("/forgot-password")
        .send({ email: "a@b.com" });
      expect(res.status).toBe(200);
    });

    it("should return 400 with invalid email", async () => {
      const res = await request(app)
        .post("/forgot-password")
        .send({ email: "nope" });
      expect(res.status).toBe(400);
    });

    it("should return 400 with missing email", async () => {
      const res = await request(app).post("/forgot-password").send({});
      expect(res.status).toBe(400);
    });
  });

  // ─── POST /reset-password ─────────────────────────────
  describe("POST /reset-password", () => {
    it("should return 200 with valid token and newPassword", async () => {
      const res = await request(app)
        .post("/reset-password")
        .send({ token: "tok", newPassword: "newSecure1!" });
      expect(res.status).toBe(200);
    });

    it("should return 400 with missing token", async () => {
      const res = await request(app)
        .post("/reset-password")
        .send({ newPassword: "newSecure1!" });
      expect(res.status).toBe(400);
    });

    it("should return 400 with short newPassword", async () => {
      const res = await request(app)
        .post("/reset-password")
        .send({ token: "tok", newPassword: "short" });
      expect(res.status).toBe(400);
    });

    it("should return 400 with empty body", async () => {
      const res = await request(app).post("/reset-password").send({});
      expect(res.status).toBe(400);
    });
  });
});

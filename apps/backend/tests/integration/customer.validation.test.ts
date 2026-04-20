import request from "supertest";
import app from "@/app";

describe("Customer API Validation", () => {
  describe("POST /api/v1/customer/auth/register", () => {
    it("returns 400 for invalid email", async () => {
      const res = await request(app)
        .post("/api/v1/customer/auth/register")
        .send({
          email: "not-an-email",
          password: "Password123",
          name: "Test User",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation error");
    });

    it("returns 400 for weak password", async () => {
      const res = await request(app)
        .post("/api/v1/customer/auth/register")
        .send({
          email: "test@example.com",
          password: "weak",
          name: "Test User",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation error");
    });

    it("returns 400 for missing required fields", async () => {
      const res = await request(app)
        .post("/api/v1/customer/auth/register")
        .send({
          email: "test@example.com",
        });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/v1/customer/auth/login", () => {
    it("returns 400 for invalid email", async () => {
      const res = await request(app)
        .post("/api/v1/customer/auth/login")
        .send({
          email: "not-an-email",
          password: "Password123",
        });

      expect(res.status).toBe(400);
    });

    it("returns 400 for missing password", async () => {
      const res = await request(app)
        .post("/api/v1/customer/auth/login")
        .send({
          email: "test@example.com",
        });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/v1/customer/auth/reset-password", () => {
    it("returns 400 for weak new password", async () => {
      const res = await request(app)
        .post("/api/v1/customer/auth/reset-password")
        .send({
          token: "some-token",
          newPassword: "weak",
        });

      expect(res.status).toBe(400);
    });
  });

  describe("Protected routes without auth", () => {
    it("returns 401 for GET /api/v1/customer/profile without token", async () => {
      const res = await request(app).get("/api/v1/customer/profile");

      expect(res.status).toBe(401);
    });

    it("returns 401 for PUT /api/v1/customer/profile without token", async () => {
      const res = await request(app)
        .put("/api/v1/customer/profile")
        .send({ name: "New Name" });

      expect(res.status).toBe(401);
    });

    it("returns 401 for GET /api/v1/customer/addresses without token", async () => {
      const res = await request(app).get("/api/v1/customer/addresses");

      expect(res.status).toBe(401);
    });
  });
});

import request from "supertest";
import express, { Request, Response } from "express";
import { validate } from "@/middlewares/validate.middleware";
import { createUserSchema } from "@/modules/user/user.validation";

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.post("/users", validate(createUserSchema), (_req: Request, res: Response) => {
    res.status(201).json({ ok: true });
  });

  return app;
}

describe("User Validation — Integration", () => {
  const app = createTestApp();

  describe("POST /users", () => {
    it("should return 201 with valid body", async () => {
      const res = await request(app)
        .post("/users")
        .send({ email: "admin@test.com", password: "secureP@ss1", role: "admin" });
      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
    });

    it("should return 201 with only required fields (defaults applied)", async () => {
      const res = await request(app)
        .post("/users")
        .send({ email: "user@test.com", password: "secureP@ss1" });
      expect(res.status).toBe(201);
    });

    it("should return 400 with invalid email", async () => {
      const res = await request(app)
        .post("/users")
        .send({ email: "bad", password: "secureP@ss1" });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation error");
    });

    it("should return 400 with short password", async () => {
      const res = await request(app)
        .post("/users")
        .send({ email: "user@test.com", password: "short" });
      expect(res.status).toBe(400);
    });

    it("should return 400 with long password", async () => {
      const res = await request(app)
        .post("/users")
        .send({ email: "user@test.com", password: "a".repeat(129) });
      expect(res.status).toBe(400);
    });

    it("should return 400 with missing email", async () => {
      const res = await request(app)
        .post("/users")
        .send({ password: "secureP@ss1" });
      expect(res.status).toBe(400);
    });

    it("should return 400 with missing password", async () => {
      const res = await request(app)
        .post("/users")
        .send({ email: "user@test.com" });
      expect(res.status).toBe(400);
    });

    it("should return 400 with empty body", async () => {
      const res = await request(app).post("/users").send({});
      expect(res.status).toBe(400);
    });

    it("should return 400 with invalid role", async () => {
      const res = await request(app)
        .post("/users")
        .send({ email: "user@test.com", password: "secureP@ss1", role: "superadmin" });
      expect(res.status).toBe(400);
    });
  });
});

import request from "supertest";
import express, { Request, Response } from "express";
import { validate } from "@/middlewares/validate.middleware";
import {
  createProductSchema,
  updateProductSchema,
} from "@/modules/product/product.validation";

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.post("/products", validate(createProductSchema), (_req: Request, res: Response) => {
    res.status(201).json({ ok: true });
  });
  app.put("/products/:id", validate(updateProductSchema), (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  return app;
}

describe("Product Validation — Integration", () => {
  const app = createTestApp();

  // ─── POST /products ───────────────────────────────────
  describe("POST /products", () => {
    it("should return 201 with valid body", async () => {
      const res = await request(app).post("/products").send({
        name: "Widget",
        price: 29.99,
        stock: 100,
        sku: "WDG-001",
      });
      expect(res.status).toBe(201);
    });

    it("should return 400 with empty name", async () => {
      const res = await request(app).post("/products").send({
        name: "",
        price: 29.99,
        stock: 100,
        sku: "WDG-001",
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation error");
    });

    it("should return 400 with negative price", async () => {
      const res = await request(app).post("/products").send({
        name: "Widget",
        price: -1,
        stock: 100,
        sku: "WDG-001",
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 with negative stock", async () => {
      const res = await request(app).post("/products").send({
        name: "Widget",
        price: 29.99,
        stock: -5,
        sku: "WDG-001",
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 with invalid SKU", async () => {
      const res = await request(app).post("/products").send({
        name: "Widget",
        price: 29.99,
        stock: 100,
        sku: "BAD SKU!@#",
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 with empty body", async () => {
      const res = await request(app).post("/products").send({});
      expect(res.status).toBe(400);
    });
  });

  // ─── PUT /products/:id ────────────────────────────────
  describe("PUT /products/:id", () => {
    it("should return 200 with partial update", async () => {
      const res = await request(app)
        .put("/products/1")
        .send({ price: 49.99 });
      expect(res.status).toBe(200);
    });

    it("should return 200 with empty body (no updates)", async () => {
      const res = await request(app).put("/products/1").send({});
      expect(res.status).toBe(200);
    });

    it("should return 400 with negative price", async () => {
      const res = await request(app)
        .put("/products/1")
        .send({ price: -10 });
      expect(res.status).toBe(400);
    });

    it("should return 200 with isActive toggle", async () => {
      const res = await request(app)
        .put("/products/1")
        .send({ isActive: false });
      expect(res.status).toBe(200);
    });
  });
});

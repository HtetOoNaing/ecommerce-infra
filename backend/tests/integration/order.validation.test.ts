import request from "supertest";
import express, { Request, Response } from "express";
import { validate } from "@/middlewares/validate.middleware";
import {
  createOrderSchema,
  updateOrderSchema,
} from "@/modules/order/order.validation";

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.post("/orders", validate(createOrderSchema), (_req: Request, res: Response) => {
    res.status(201).json({ ok: true });
  });
  app.put("/orders/:id", validate(updateOrderSchema), (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  return app;
}

describe("Order Validation — Integration", () => {
  const app = createTestApp();

  // ─── POST /orders ─────────────────────────────────────
  describe("POST /orders", () => {
    it("should return 201 with valid body", async () => {
      const res = await request(app).post("/orders").send({
        userId: 1,
        items: [{ productId: 1, quantity: 2 }],
        shippingAddress: "123 Test St, City, Country",
      });
      expect(res.status).toBe(201);
    });

    it("should return 201 with optional billing address and notes", async () => {
      const res = await request(app).post("/orders").send({
        userId: 1,
        items: [{ productId: 1, quantity: 2 }],
        shippingAddress: "123 Test St",
        billingAddress: "456 Bill St",
        notes: "Please gift wrap",
      });
      expect(res.status).toBe(201);
    });

    it("should return 400 with empty items array", async () => {
      const res = await request(app).post("/orders").send({
        userId: 1,
        items: [],
        shippingAddress: "123 Test St",
      });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Validation error");
    });

    it("should return 400 with missing userId", async () => {
      const res = await request(app).post("/orders").send({
        items: [{ productId: 1, quantity: 2 }],
        shippingAddress: "123 Test St",
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 with missing shipping address", async () => {
      const res = await request(app).post("/orders").send({
        userId: 1,
        items: [{ productId: 1, quantity: 2 }],
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 with invalid quantity (zero)", async () => {
      const res = await request(app).post("/orders").send({
        userId: 1,
        items: [{ productId: 1, quantity: 0 }],
        shippingAddress: "123 Test St",
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 with invalid quantity (negative)", async () => {
      const res = await request(app).post("/orders").send({
        userId: 1,
        items: [{ productId: 1, quantity: -1 }],
        shippingAddress: "123 Test St",
      });
      expect(res.status).toBe(400);
    });

    it("should return 400 with empty body", async () => {
      const res = await request(app).post("/orders").send({});
      expect(res.status).toBe(400);
    });
  });

  // ─── PUT /orders/:id ──────────────────────────────────
  describe("PUT /orders/:id", () => {
    it("should return 200 with status update", async () => {
      const res = await request(app)
        .put("/orders/1")
        .send({ status: "processing" });
      expect(res.status).toBe(200);
    });

    it("should return 200 with payment status update", async () => {
      const res = await request(app)
        .put("/orders/1")
        .send({ paymentStatus: "paid" });
      expect(res.status).toBe(200);
    });

    it("should return 200 with empty body (no updates)", async () => {
      const res = await request(app).put("/orders/1").send({});
      expect(res.status).toBe(200);
    });

    it("should return 400 with invalid status", async () => {
      const res = await request(app)
        .put("/orders/1")
        .send({ status: "invalid_status" });
      expect(res.status).toBe(400);
    });

    it("should return 400 with invalid payment status", async () => {
      const res = await request(app)
        .put("/orders/1")
        .send({ paymentStatus: "unknown" });
      expect(res.status).toBe(400);
    });

    it("should return 200 with shipping address update", async () => {
      const res = await request(app)
        .put("/orders/1")
        .send({ shippingAddress: "New Address" });
      expect(res.status).toBe(200);
    });

    it("should return 200 with notes update", async () => {
      const res = await request(app)
        .put("/orders/1")
        .send({ notes: "Updated notes" });
      expect(res.status).toBe(200);
    });
  });
});

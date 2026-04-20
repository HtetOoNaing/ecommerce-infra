import request from "supertest";
import express, { Request, Response } from "express";
import { validate } from "@/middlewares/validate.middleware";
import { createCheckoutSchema } from "@/modules/checkout/checkout.validation";

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.post(
    "/checkout",
    validate(createCheckoutSchema),
    (_req: Request, res: Response) => {
      res.json({ ok: true });
    }
  );

  app.use(
    (
      err: { status?: number; message?: string },
      _req: Request,
      res: Response,
      _next: express.NextFunction
    ) => {
      res.status(err.status ?? 400).json({ error: err.message });
    }
  );

  return app;
}

describe("Checkout Validation — Integration", () => {
  const app = createTestApp();

  const validBody = {
    items: [{ productId: 1, quantity: 2 }],
    shippingAddress: {
      name: "John Doe",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "US",
    },
  };

  // ─── POST /checkout ────────────────────────────────────
  describe("POST /checkout", () => {
    it("accepts a valid checkout body", async () => {
      const res = await request(app).post("/checkout").send(validBody);
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    it("rejects when items array is empty", async () => {
      const res = await request(app)
        .post("/checkout")
        .send({ ...validBody, items: [] });
      expect(res.status).toBe(400);
    });

    it("rejects when productId is missing", async () => {
      const res = await request(app)
        .post("/checkout")
        .send({
          ...validBody,
          items: [{ quantity: 2 }],
        });
      expect(res.status).toBe(400);
    });

    it("rejects when quantity is zero", async () => {
      const res = await request(app)
        .post("/checkout")
        .send({
          ...validBody,
          items: [{ productId: 1, quantity: 0 }],
        });
      expect(res.status).toBe(400);
    });

    it("rejects when quantity is negative", async () => {
      const res = await request(app)
        .post("/checkout")
        .send({
          ...validBody,
          items: [{ productId: 1, quantity: -1 }],
        });
      expect(res.status).toBe(400);
    });

    it("rejects when shippingAddress is missing", async () => {
      const res = await request(app)
        .post("/checkout")
        .send({ items: validBody.items });
      expect(res.status).toBe(400);
    });

    it("rejects when shippingAddress.name is missing", async () => {
      const { name: _name, ...addressWithoutName } = validBody.shippingAddress;
      const res = await request(app)
        .post("/checkout")
        .send({ ...validBody, shippingAddress: addressWithoutName });
      expect(res.status).toBe(400);
    });

    it("rejects when shippingAddress.zip is missing", async () => {
      const { zip: _zip, ...addressWithoutZip } = validBody.shippingAddress;
      const res = await request(app)
        .post("/checkout")
        .send({ ...validBody, shippingAddress: addressWithoutZip });
      expect(res.status).toBe(400);
    });

    it("rejects an empty body", async () => {
      const res = await request(app).post("/checkout").send({});
      expect(res.status).toBe(400);
    });
  });
});

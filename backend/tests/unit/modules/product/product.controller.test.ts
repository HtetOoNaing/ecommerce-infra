import { AppError } from "@/utils/appError";

// We need to mock the service BEFORE importing the controller,
// because the controller file creates `const service = new ProductService()` at module scope.
const mockCreate = jest.fn();
const mockGetAll = jest.fn();
const mockGetById = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock("@/modules/product/product.service", () => ({
  ProductService: jest.fn().mockImplementation(() => ({
    create: mockCreate,
    getAll: mockGetAll,
    getById: mockGetById,
    update: mockUpdate,
    delete: mockDelete,
  })),
}));

import express from "express";
import request from "supertest";
import { ProductController } from "@/modules/product/product.controller";

function createApp() {
  const app = express();
  app.use(express.json());
  const ctrl = new ProductController();

  app.post("/products", (req: any, _res, next) => {
    req.user = { id: 1 };
    next();
  }, ctrl.create.bind(ctrl));
  app.get("/products", ctrl.getAll.bind(ctrl));
  app.get("/products/:id", ctrl.getById.bind(ctrl));
  app.put("/products/:id", ctrl.update.bind(ctrl));
  app.delete("/products/:id", ctrl.delete.bind(ctrl));

  app.use((err: any, _req: any, res: any, _next: any) => {
    res.status(err.status || 500).json({ message: err.message });
  });

  return app;
}

const mockDto = {
  id: 1, name: "W", description: null, price: 10, stock: 5,
  sku: "W-1", isActive: true, createdBy: 1,
  createdAt: new Date(), updatedAt: new Date(),
};

describe("ProductController", () => {
  const app = createApp();

  afterEach(() => jest.clearAllMocks());

  describe("POST /products", () => {
    it("should return 201 on success", async () => {
      mockCreate.mockResolvedValue(mockDto);

      const res = await request(app)
        .post("/products")
        .send({ name: "W", price: 10, stock: 5, sku: "W-1" });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe("W");
    });

    it("should return 409 on duplicate SKU", async () => {
      mockCreate.mockRejectedValue(AppError.conflict("SKU exists"));

      const res = await request(app)
        .post("/products")
        .send({ name: "W", price: 10, stock: 5, sku: "DUP" });

      expect(res.status).toBe(409);
    });
  });

  describe("GET /products", () => {
    it("should return 200 with products array", async () => {
      mockGetAll.mockResolvedValue([mockDto]);

      const res = await request(app).get("/products");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe("GET /products/:id", () => {
    it("should return 200 with product", async () => {
      mockGetById.mockResolvedValue(mockDto);

      const res = await request(app).get("/products/1");
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
    });

    it("should return 404 for missing product", async () => {
      mockGetById.mockRejectedValue(AppError.notFound("Not found"));

      const res = await request(app).get("/products/999");
      expect(res.status).toBe(404);
    });
  });

  describe("PUT /products/:id", () => {
    it("should return 200 with updated product", async () => {
      mockUpdate.mockResolvedValue({ ...mockDto, name: "Updated" });

      const res = await request(app)
        .put("/products/1")
        .send({ name: "Updated" });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Updated");
    });
  });

  describe("DELETE /products/:id", () => {
    it("should return 204 on success", async () => {
      mockDelete.mockResolvedValue(undefined);

      const res = await request(app).delete("/products/1");
      expect(res.status).toBe(204);
    });
  });
});

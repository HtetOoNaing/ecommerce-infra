import { Request, Response } from "express";
import { OrderController } from "@/modules/order/order.controller";
import { OrderService } from "@/modules/order/order.service";
import { AppError } from "@/utils/appError";
import { OrderStatus, PaymentStatus } from "@/modules/order/order.types";

// Mock the service
jest.mock("@/modules/order/order.service");

const mockOrder = {
  id: 1,
  userId: 1,
  status: "pending" as OrderStatus,
  paymentStatus: "pending" as PaymentStatus,
  totalAmount: 59.98,
  shippingAddress: "123 Test St",
  billingAddress: null,
  notes: null,
  items: [
    {
      id: 1,
      productId: 1,
      quantity: 2,
      unitPrice: 29.99,
      product: { id: 1, name: "Widget", sku: "WDG-001" },
    },
  ],
  user: { id: 1, email: "user@test.com", name: "Test User" },
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("OrderController", () => {
  let controller: OrderController;
  let serviceMock: jest.Mocked<OrderService>;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    controller = new OrderController();
    serviceMock = (controller as any).service as jest.Mocked<OrderService>;

    req = {
      params: {},
      query: {},
      body: {},
    };

    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe("getAll", () => {
    it("should return paginated orders", async () => {
      const paginatedResult = {
        data: [mockOrder],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      serviceMock.getAll.mockResolvedValue(paginatedResult);
      req.query = { page: "1", limit: "10" };

      await controller.getAll(req as Request, res as Response);

      expect(serviceMock.getAll).toHaveBeenCalledWith({ page: "1", limit: "10" });
      expect(res.json).toHaveBeenCalledWith(paginatedResult);
    });
  });

  describe("getById", () => {
    it("should return order by id", async () => {
      serviceMock.getById.mockResolvedValue(mockOrder);
      req.params = { id: "1" };

      await controller.getById(req as Request, res as Response);

      expect(serviceMock.getById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockOrder);
    });

    it("should propagate 404 error", async () => {
      serviceMock.getById.mockRejectedValue(AppError.notFound("Order not found"));
      req.params = { id: "999" };

      await expect(controller.getById(req as Request, res as Response)).rejects.toThrow(AppError);
    });
  });

  describe("getByUserId", () => {
    it("should return orders for user", async () => {
      const paginatedResult = {
        data: [mockOrder],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      serviceMock.getByUserId.mockResolvedValue(paginatedResult);
      req.params = { userId: "1" };
      req.query = { page: "1", limit: "10" };

      await controller.getByUserId(req as Request, res as Response);

      expect(serviceMock.getByUserId).toHaveBeenCalledWith(1, { page: "1", limit: "10" });
      expect(res.json).toHaveBeenCalledWith(paginatedResult);
    });
  });

  describe("create", () => {
    it("should create order and return 201", async () => {
      const createData = {
        userId: 1,
        items: [{ productId: 1, quantity: 2 }],
        shippingAddress: "123 Test St",
      };
      serviceMock.create.mockResolvedValue(mockOrder);
      req.body = createData;

      await controller.create(req as Request, res as Response);

      expect(serviceMock.create).toHaveBeenCalledWith(createData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockOrder);
    });
  });

  describe("update", () => {
    it("should update order", async () => {
      const updateData = { status: "processing" as OrderStatus };
      const updatedOrder = { ...mockOrder, status: "processing" as OrderStatus };
      serviceMock.update.mockResolvedValue(updatedOrder);
      req.params = { id: "1" };
      req.body = updateData;

      await controller.update(req as Request, res as Response);

      expect(serviceMock.update).toHaveBeenCalledWith(1, updateData);
      expect(res.json).toHaveBeenCalledWith(updatedOrder);
    });
  });

  describe("delete", () => {
    it("should delete order and return 204", async () => {
      serviceMock.delete.mockResolvedValue(undefined);
      req.params = { id: "1" };

      await controller.delete(req as Request, res as Response);

      expect(serviceMock.delete).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });
});

import { OrderService } from "@/modules/order/order.service";
import { OrderRepository } from "@/modules/order/order.repository";
import { ProductRepository } from "@/modules/product/product.repository";
import { UserRepository } from "@/modules/user/user.repository";
import { AppError } from "@/utils/appError";
import { OrderEntity, OrderStatus, PaymentStatus } from "@/modules/order/order.types";
import { ProductEntity } from "@/modules/product/product.types";
import { UserEntity } from "@/modules/user/user.types";

// Mock the repositories
jest.mock("@/modules/order/order.repository");
jest.mock("@/modules/product/product.repository");
jest.mock("@/modules/user/user.repository");

const mockUser: UserEntity = {
  id: 1,
  email: "user@test.com",
  password: "hashedpassword",
  name: "Test User",
  role: "user",
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProduct: ProductEntity = {
  id: 1,
  name: "Widget",
  description: "A fine widget",
  price: 29.99,
  stock: 100,
  sku: "WDG-001",
  isActive: true,
  createdBy: 1,
  categoryId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOrder: OrderEntity = {
  id: 1,
  userId: 1,
  status: "pending" as OrderStatus,
  paymentStatus: "pending" as PaymentStatus,
  totalAmount: 59.98,
  shippingAddress: "123 Test St",
  billingAddress: null,
  notes: null,
  user: mockUser,
  items: [
    {
      id: 1,
      orderId: 1,
      productId: 1,
      quantity: 2,
      unitPrice: 29.99,
      product: { id: 1, name: "Widget", sku: "WDG-001" },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("OrderService", () => {
  let service: OrderService;
  let orderRepoMock: jest.Mocked<OrderRepository>;
  let productRepoMock: jest.Mocked<ProductRepository>;
  let userRepoMock: jest.Mocked<UserRepository>;

  beforeEach(() => {
    service = new OrderService();
    orderRepoMock = (service as any).repo as jest.Mocked<OrderRepository>;
    productRepoMock = (service as any).productRepo as jest.Mocked<ProductRepository>;
    userRepoMock = (service as any).userRepo as jest.Mocked<UserRepository>;
  });

  describe("create", () => {
    it("should create an order when user and products exist", async () => {
      userRepoMock.findById.mockResolvedValue(mockUser);
      productRepoMock.findById.mockResolvedValue(mockProduct);
      productRepoMock.update.mockResolvedValue({ ...mockProduct, stock: 98 });
      orderRepoMock.create.mockResolvedValue(mockOrder);

      const result = await service.create({
        userId: 1,
        items: [{ productId: 1, quantity: 2 }],
        shippingAddress: "123 Test St",
      });

      expect(userRepoMock.findById).toHaveBeenCalledWith(1);
      expect(productRepoMock.findById).toHaveBeenCalledWith(1);
      expect(orderRepoMock.create).toHaveBeenCalled();
      expect(result.id).toBe(1);
      expect(result.totalAmount).toBe(59.98);
    });

    it("should throw 404 when user not found", async () => {
      userRepoMock.findById.mockResolvedValue(null);

      await expect(
        service.create({
          userId: 999,
          items: [{ productId: 1, quantity: 1 }],
          shippingAddress: "123 Test St",
        })
      ).rejects.toThrow(AppError);

      try {
        await service.create({
          userId: 999,
          items: [{ productId: 1, quantity: 1 }],
          shippingAddress: "123 Test St",
        });
      } catch (err: any) {
        expect(err.status).toBe(404);
      }
    });

    it("should throw 404 when product not found", async () => {
      userRepoMock.findById.mockResolvedValue(mockUser);
      productRepoMock.findById.mockResolvedValue(null);

      await expect(
        service.create({
          userId: 1,
          items: [{ productId: 999, quantity: 1 }],
          shippingAddress: "123 Test St",
        })
      ).rejects.toThrow(AppError);

      try {
        await service.create({
          userId: 1,
          items: [{ productId: 999, quantity: 1 }],
          shippingAddress: "123 Test St",
        });
      } catch (err: any) {
        expect(err.status).toBe(404);
      }
    });

    it("should throw 400 when product is inactive", async () => {
      userRepoMock.findById.mockResolvedValue(mockUser);
      productRepoMock.findById.mockResolvedValue({ ...mockProduct, isActive: false });

      await expect(
        service.create({
          userId: 1,
          items: [{ productId: 1, quantity: 1 }],
          shippingAddress: "123 Test St",
        })
      ).rejects.toThrow(AppError);

      try {
        await service.create({
          userId: 1,
          items: [{ productId: 1, quantity: 1 }],
          shippingAddress: "123 Test St",
        });
      } catch (err: any) {
        expect(err.status).toBe(400);
      }
    });

    it("should throw 400 when insufficient stock", async () => {
      userRepoMock.findById.mockResolvedValue(mockUser);
      productRepoMock.findById.mockResolvedValue({ ...mockProduct, stock: 1 });

      await expect(
        service.create({
          userId: 1,
          items: [{ productId: 1, quantity: 5 }],
          shippingAddress: "123 Test St",
        })
      ).rejects.toThrow(AppError);

      try {
        await service.create({
          userId: 1,
          items: [{ productId: 1, quantity: 5 }],
          shippingAddress: "123 Test St",
        });
      } catch (err: any) {
        expect(err.status).toBe(400);
      }
    });
  });

  describe("getAll", () => {
    it("should return paginated orders", async () => {
      orderRepoMock.findAll.mockResolvedValue({
        data: [mockOrder],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      const result = await service.getAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.data[0].id).toBe(1);
    });
  });

  describe("getById", () => {
    it("should return order when found", async () => {
      orderRepoMock.findById.mockResolvedValue(mockOrder);

      const result = await service.getById(1);

      expect(result.id).toBe(1);
      expect(result.status).toBe("pending");
    });

    it("should throw 404 when order not found", async () => {
      orderRepoMock.findById.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrow(AppError);

      try {
        await service.getById(999);
      } catch (err: any) {
        expect(err.status).toBe(404);
      }
    });
  });

  describe("getByUserId", () => {
    it("should return paginated orders for user", async () => {
      userRepoMock.findById.mockResolvedValue(mockUser);
      orderRepoMock.findByUserId.mockResolvedValue({
        data: [mockOrder],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      const result = await service.getByUserId(1, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(userRepoMock.findById).toHaveBeenCalledWith(1);
    });

    it("should throw 404 when user not found", async () => {
      userRepoMock.findById.mockResolvedValue(null);

      await expect(service.getByUserId(999, { page: 1, limit: 10 })).rejects.toThrow(AppError);

      try {
        await service.getByUserId(999, { page: 1, limit: 10 });
      } catch (err: any) {
        expect(err.status).toBe(404);
      }
    });
  });

  describe("update", () => {
    it("should update order status", async () => {
      const updated = { ...mockOrder, status: "processing" as OrderStatus };
      orderRepoMock.update.mockResolvedValue(updated);

      const result = await service.update(1, { status: "processing" });

      expect(result.status).toBe("processing");
    });

    it("should throw 404 when order not found", async () => {
      orderRepoMock.update.mockResolvedValue(null);

      await expect(service.update(999, { status: "processing" })).rejects.toThrow(AppError);
    });
  });

  describe("delete", () => {
    it("should delete pending order and restore stock", async () => {
      orderRepoMock.findById.mockResolvedValue(mockOrder);
      productRepoMock.findById.mockResolvedValue(mockProduct);
      productRepoMock.update.mockResolvedValue(mockProduct);
      orderRepoMock.delete.mockResolvedValue(true);

      await expect(service.delete(1)).resolves.toBeUndefined();

      expect(productRepoMock.update).toHaveBeenCalled();
      expect(orderRepoMock.delete).toHaveBeenCalledWith(1);
    });

    it("should delete delivered order without restoring stock", async () => {
      const deliveredOrder = { ...mockOrder, status: "delivered" as OrderStatus };
      orderRepoMock.findById.mockResolvedValue(deliveredOrder);
      orderRepoMock.delete.mockResolvedValue(true);

      await expect(service.delete(1)).resolves.toBeUndefined();

      expect(productRepoMock.update).not.toHaveBeenCalled();
    });

    it("should throw 404 when order not found", async () => {
      orderRepoMock.findById.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(AppError);

      try {
        await service.delete(999);
      } catch (err: any) {
        expect(err.status).toBe(404);
      }
    });
  });
});

import { OrderRepository } from "@/modules/order/order.repository";
import { Order, OrderItem } from "@/modules/order/order.model";
import { OrderStatus, PaymentStatus } from "@/modules/order/order.types";

// Mock the models
jest.mock("@/modules/order/order.model");

const mockOrder = {
  id: 1,
  userId: 1,
  status: "pending" as OrderStatus,
  paymentStatus: "pending" as PaymentStatus,
  totalAmount: 59.98,
  shippingAddress: "123 Test St",
  billingAddress: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  toJSON: jest.fn().mockReturnValue({
    id: 1,
    userId: 1,
    status: "pending",
    paymentStatus: "pending",
    totalAmount: 59.98,
    shippingAddress: "123 Test St",
    billingAddress: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
};

const mockOrderItem = {
  id: 1,
  orderId: 1,
  productId: 1,
  quantity: 2,
  unitPrice: 29.99,
  createdAt: new Date(),
  updatedAt: new Date(),
  toJSON: jest.fn().mockReturnValue({
    id: 1,
    orderId: 1,
    productId: 1,
    quantity: 2,
    unitPrice: 29.99,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
};

describe("OrderRepository", () => {
  let repo: OrderRepository;

  beforeEach(() => {
    repo = new OrderRepository();
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create order and items", async () => {
      const createData = {
        userId: 1,
        items: [{ productId: 1, quantity: 2, unitPrice: 29.99 }],
        shippingAddress: "123 Test St",
        billingAddress: undefined,
        notes: undefined,
      };
      const totalAmount = 59.98;

      (Order.create as jest.Mock).mockResolvedValue(mockOrder);
      (OrderItem.create as jest.Mock).mockResolvedValue(mockOrderItem);
      (Order.findByPk as jest.Mock).mockResolvedValue(mockOrder);

      const result = await repo.create(createData, totalAmount);

      expect(Order.create).toHaveBeenCalledWith({
        userId: 1,
        totalAmount,
        shippingAddress: "123 Test St",
        billingAddress: null,
        notes: null,
      });
      expect(OrderItem.create).toHaveBeenCalled();
      expect(result.id).toBe(1);
    });
  });

  describe("findAll", () => {
    it("should return paginated orders", async () => {
      const mockFindAndCountAll = jest.fn().mockResolvedValue({
        count: 1,
        rows: [mockOrder],
      });
      (Order.findAndCountAll as jest.Mock) = mockFindAndCountAll;

      const result = await repo.findAll(1, 10);

      expect(mockFindAndCountAll).toHaveBeenCalledWith({
        order: [["createdAt", "DESC"]],
        limit: 10,
        offset: 0,
        include: expect.any(Array),
      });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });
  });

  describe("findById", () => {
    it("should return order with items when found", async () => {
      const orderWithItems = {
        ...mockOrder,
        items: [mockOrderItem],
        toJSON: jest.fn().mockReturnValue({
          ...mockOrder.toJSON(),
          items: [mockOrderItem.toJSON()],
        }),
      };
      (Order.findByPk as jest.Mock).mockResolvedValue(orderWithItems);

      const result = await repo.findById(1);

      expect(Order.findByPk).toHaveBeenCalledWith(1, {
        include: expect.any(Array),
      });
      expect(result?.id).toBe(1);
    });

    it("should return null when order not found", async () => {
      (Order.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await repo.findById(999);

      expect(result).toBeNull();
    });
  });

  describe("findByUserId", () => {
    it("should return paginated orders for user", async () => {
      const mockFindAndCountAll = jest.fn().mockResolvedValue({
        count: 1,
        rows: [mockOrder],
      });
      (Order.findAndCountAll as jest.Mock) = mockFindAndCountAll;

      const result = await repo.findByUserId(1, 1, 10);

      expect(mockFindAndCountAll).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: [["createdAt", "DESC"]],
        limit: 10,
        offset: 0,
        include: expect.any(Array),
      });
      expect(result.data).toHaveLength(1);
    });
  });

  describe("update", () => {
    it("should update and return order", async () => {
      const orderInstance = {
        ...mockOrder,
        update: jest.fn().mockResolvedValue(undefined),
      };
      (Order.findByPk as jest.Mock).mockResolvedValue(orderInstance);
      (Order.findByPk as jest.Mock).mockResolvedValueOnce(orderInstance).mockResolvedValueOnce(mockOrder);

      const result = await repo.update(1, { status: "processing" });

      expect(orderInstance.update).toHaveBeenCalledWith({ status: "processing" });
    });

    it("should return null when order not found", async () => {
      (Order.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await repo.update(999, { status: "processing" });

      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete order and return true", async () => {
      (Order.destroy as jest.Mock).mockResolvedValue(1);

      const result = await repo.delete(1);

      expect(Order.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(true);
    });

    it("should return false when order not found", async () => {
      (Order.destroy as jest.Mock).mockResolvedValue(0);

      const result = await repo.delete(999);

      expect(result).toBe(false);
    });
  });
});

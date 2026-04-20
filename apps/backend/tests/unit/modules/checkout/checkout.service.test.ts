// ts-jest does NOT support the babel "mock*" variable hoisting exception.
// Instead, we attach stable mock fns to the constructor itself inside the factory,
// then retrieve them after the import resolves.
jest.mock("stripe", () => {
  const create = jest.fn();
  const constructEvent = jest.fn();
  const MockStripe = jest.fn().mockImplementation(() => ({
    paymentIntents: { create },
    webhooks: { constructEvent },
  }));
  (MockStripe as any).__create = create;
  (MockStripe as any).__constructEvent = constructEvent;
  return MockStripe;
});

import { CheckoutService } from "@/modules/checkout/checkout.service";

jest.mock("@/modules/product/product.model", () => ({
  Product: {
    findByPk: jest.fn(),
    decrement: jest.fn(),
  },
}));

jest.mock("@/modules/order/order.model", () => ({
  Order: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
  OrderItem: {
    create: jest.fn(),
  },
}));

jest.mock("@/modules/customer/customer.model", () => ({
  Customer: {
    findByPk: jest.fn(),
  },
}));

jest.mock("@/config/db", () => ({
  sequelize: {
    transaction: jest.fn((cb: (t: unknown) => Promise<unknown>) => cb({})),
  },
}));

jest.mock("@/jobs/producers/email.producer", () => ({
  addEmailJob: jest.fn(),
}));

jest.mock("@/config/env", () => ({
  env: {
    STRIPE_SECRET_KEY: "sk_test_mock",
    STRIPE_WEBHOOK_SECRET: "whsec_mock",
  },
}));

import Stripe from "stripe";
import { Product } from "@/modules/product/product.model";
import { Order, OrderItem } from "@/modules/order/order.model";
import { Customer } from "@/modules/customer/customer.model";
import { addEmailJob } from "@/jobs/producers/email.producer";

// Retrieve the stable mock fns attached to the constructor by the factory above
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StripeCtor = Stripe as unknown as any;
const mockPaymentIntentsCreate = StripeCtor.__create as jest.Mock;
const mockWebhooksConstructEvent = StripeCtor.__constructEvent as jest.Mock;

const ProductFindByPk = Product.findByPk as jest.Mock;
const ProductDecrement = Product.decrement as jest.Mock;
const OrderFindOne = Order.findOne as jest.Mock;
const OrderCreate = Order.create as jest.Mock;
const OrderItemCreate = OrderItem.create as jest.Mock;
const CustomerFindByPk = Customer.findByPk as jest.Mock;
const addEmailJobMock = addEmailJob as jest.MockedFunction<typeof addEmailJob>;

const mockProduct = {
  id: 1,
  name: "Widget",
  price: 10.0,
  stock: 50,
  isActive: true,
  sku: "WDG-001",
};

const mockPaymentIntentId = "pi_test_123";

const validShipping = {
  name: "John",
  address: "1 Main St",
  city: "NYC",
  state: "NY",
  zip: "10001",
  country: "US",
};

describe("CheckoutService", () => {
  let service: CheckoutService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CheckoutService();
  });

  // ─── createPaymentIntent ───────────────────────────────
  describe("createPaymentIntent", () => {
    it("creates a PaymentIntent and returns clientSecret", async () => {
      ProductFindByPk.mockResolvedValue(mockProduct);
      mockPaymentIntentsCreate.mockResolvedValue({
        id: mockPaymentIntentId,
        client_secret: "cs_test_secret",
      });

      const result = await service.createPaymentIntent(1, {
        items: [{ productId: 1, quantity: 2 }],
        shippingAddress: validShipping,
      });

      expect(result.clientSecret).toBe("cs_test_secret");
      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 2000,
          currency: "usd",
        })
      );
    });

    it("throws 404 when product not found", async () => {
      ProductFindByPk.mockResolvedValue(null);

      await expect(
        service.createPaymentIntent(1, {
          items: [{ productId: 999, quantity: 1 }],
          shippingAddress: validShipping,
        })
      ).rejects.toMatchObject({ status: 404 });
    });

    it("throws 400 when product is inactive", async () => {
      ProductFindByPk.mockResolvedValue({ ...mockProduct, isActive: false });

      await expect(
        service.createPaymentIntent(1, {
          items: [{ productId: 1, quantity: 1 }],
          shippingAddress: validShipping,
        })
      ).rejects.toMatchObject({ status: 400 });
    });

    it("throws 400 when stock is insufficient", async () => {
      ProductFindByPk.mockResolvedValue({ ...mockProduct, stock: 1 });

      await expect(
        service.createPaymentIntent(1, {
          items: [{ productId: 1, quantity: 5 }],
          shippingAddress: validShipping,
        })
      ).rejects.toMatchObject({ status: 400 });
    });
  });

  // ─── handleWebhookEvent ────────────────────────────────
  describe("handleWebhookEvent", () => {
    it("throws 400 for invalid Stripe signature", async () => {
      mockWebhooksConstructEvent.mockImplementation(() => {
        throw new Error("No signatures found");
      });

      await expect(
        service.handleWebhookEvent(Buffer.from("{}"), "bad_sig")
      ).rejects.toMatchObject({ status: 400 });
    });

    it("processes payment_intent.succeeded and creates order", async () => {
      const items = [
        { productId: 1, quantity: 2, unitPrice: 10.0, name: "Widget" },
      ];
      const mockEvent = {
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: mockPaymentIntentId,
            metadata: {
              customerId: "7",
              items: JSON.stringify(items),
              shippingAddress: JSON.stringify(validShipping),
            },
          },
        },
      };

      mockWebhooksConstructEvent.mockReturnValue(mockEvent);
      OrderFindOne.mockResolvedValue(null);
      OrderCreate.mockResolvedValue({ id: 42 });
      OrderItemCreate.mockResolvedValue({});
      ProductDecrement.mockResolvedValue({});
      CustomerFindByPk.mockResolvedValue({ email: "customer@test.com" });
      addEmailJobMock.mockResolvedValue(undefined as unknown as ReturnType<typeof addEmailJob>);

      await service.handleWebhookEvent(Buffer.from("{}"), "sig");

      expect(OrderCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: 7,
          paymentStatus: "paid",
          status: "processing",
          stripePaymentIntentId: mockPaymentIntentId,
        }),
        expect.anything()
      );
      expect(ProductDecrement).toHaveBeenCalledWith(
        "stock",
        expect.objectContaining({ by: 2, where: { id: 1 } })
      );
      expect(addEmailJobMock).toHaveBeenCalledWith(
        expect.objectContaining({ to: "customer@test.com" })
      );
    });

    it("skips order creation if PaymentIntent already processed", async () => {
      mockWebhooksConstructEvent.mockReturnValue({
        type: "payment_intent.succeeded",
        data: {
          object: {
            id: mockPaymentIntentId,
            metadata: { customerId: "1", items: "[]", shippingAddress: "{}" },
          },
        },
      });
      OrderFindOne.mockResolvedValue({ id: 1 });

      await service.handleWebhookEvent(Buffer.from("{}"), "sig");

      expect(OrderCreate).not.toHaveBeenCalled();
    });

    it("ignores unhandled event types", async () => {
      mockWebhooksConstructEvent.mockReturnValue({
        type: "charge.succeeded",
        data: { object: {} },
      });

      await service.handleWebhookEvent(Buffer.from("{}"), "sig");

      expect(OrderCreate).not.toHaveBeenCalled();
    });
  });
});

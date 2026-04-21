import Stripe from "stripe";
import { env } from "@/config/env";
import { sequelize } from "@/config/db";
import { AppError } from "@/utils/appError";
import { Product } from "@/modules/product/product.model";
import { Order, OrderItem } from "@/modules/order/order.model";
import { Customer } from "@/modules/customer/customer.model";
import { addEmailJob } from "@/jobs/producers/email.producer";
import {
  CreateCheckoutDto,
  CheckoutSessionResponse,
  WebhookItem,
} from "./checkout.types";

// Stripe is Phase 4 - only initialize if key is present
const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;

export class CheckoutService {
  async createPaymentIntent(
    customerId: number,
    dto: CreateCheckoutDto
  ): Promise<CheckoutSessionResponse> {
    if (!stripe) {
      throw AppError.internal("Stripe is not configured");
    }
    let totalAmount = 0;
    const validatedItems: WebhookItem[] = [];

    for (const item of dto.items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        throw AppError.notFound(`Product ${item.productId} not found`);
      }
      if (!product.isActive) {
        throw AppError.badRequest(`Product "${product.name}" is not available`);
      }
      if (product.stock < item.quantity) {
        throw AppError.badRequest(
          `Insufficient stock for "${product.name}" (requested ${item.quantity}, available ${product.stock})`
        );
      }
      const unitPrice = Number(product.price);
      totalAmount += unitPrice * item.quantity;
      validatedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        name: product.name,
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        customerId: String(customerId),
        items: JSON.stringify(validatedItems),
        shippingAddress: JSON.stringify(dto.shippingAddress),
      },
    });

    return { clientSecret: paymentIntent.client_secret! };
  }

  async handleWebhookEvent(payload: Buffer, signature: string): Promise<void> {
    if (!stripe) {
      throw AppError.internal("Stripe is not configured");
    }
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch {
      throw AppError.badRequest("Invalid Stripe webhook signature");
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await this.processSuccessfulPayment(paymentIntent);
    }
  }

  private async processSuccessfulPayment(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    const existing = await Order.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });
    if (existing) return;

    const { customerId, items: itemsJson, shippingAddress: addressJson } =
      paymentIntent.metadata;

    const customerIdNum = parseInt(customerId, 10);
    const items = JSON.parse(itemsJson) as WebhookItem[];
    const totalAmount = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    const order = await sequelize.transaction(async (t) => {
      const newOrder = await Order.create(
        {
          customerId: customerIdNum,
          status: "processing",
          paymentStatus: "paid",
          totalAmount,
          shippingAddress: addressJson,
          stripePaymentIntentId: paymentIntent.id,
        },
        { transaction: t }
      );

      for (const item of items) {
        await OrderItem.create(
          {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          },
          { transaction: t }
        );

        await Product.decrement("stock", {
          by: item.quantity,
          where: { id: item.productId },
          transaction: t,
        });
      }

      return newOrder;
    });

    const customer = await Customer.findByPk(customerIdNum);
    if (customer) {
      await addEmailJob({
        to: customer.email,
        subject: `Order Confirmed #${order.id} — InfraPro`,
        html: `
          <h2>Thank you for your order!</h2>
          <p>Your payment has been confirmed and your order #${order.id} is now being processed.</p>
          <p><strong>Items ordered:</strong></p>
          <ul>
            ${items.map((i) => `<li>${i.name} × ${i.quantity} — $${(i.unitPrice * i.quantity).toFixed(2)}</li>`).join("")}
          </ul>
          <p><strong>Total: $${totalAmount.toFixed(2)}</strong></p>
        `,
      });
    }
  }
}

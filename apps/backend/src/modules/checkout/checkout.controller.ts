import { Request, Response } from "express";
import { CheckoutService } from "./checkout.service";
import { CustomerAuthRequest } from "@/middlewares/customer-auth.middleware";

const service = new CheckoutService();

export class CheckoutController {
  async createCheckoutSession(req: Request, res: Response): Promise<void> {
    const { id: customerId } = (req as CustomerAuthRequest).customer;
    const result = await service.createPaymentIntent(customerId, req.body);
    res.json(result);
  }

  async handleWebhook(req: Request, res: Response): Promise<void> {
    const signature = req.headers["stripe-signature"] as string;
    await service.handleWebhookEvent(req.body as Buffer, signature);
    res.json({ received: true });
  }
}

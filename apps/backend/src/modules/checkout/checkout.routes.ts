import { Router } from "express";
import { CheckoutController } from "./checkout.controller";
import { customerAuthenticate } from "@/middlewares/customer-auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { createCheckoutSchema } from "./checkout.validation";

const controller = new CheckoutController();

export const checkoutRouter = Router();

checkoutRouter.post(
  "/",
  customerAuthenticate,
  validate(createCheckoutSchema),
  controller.createCheckoutSession.bind(controller)
);

export const webhookRouter = Router();

webhookRouter.post("/stripe", controller.handleWebhook.bind(controller));

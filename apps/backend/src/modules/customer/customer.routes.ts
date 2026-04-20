import { Router } from "express";
import { CustomerController } from "./customer.controller";
import { customerAuthenticate } from "@/middlewares/customer-auth.middleware";
import { authRateLimiter } from "@/middlewares/rateLimit.middleware";
import { validate, validateQuery } from "@/middlewares/validate.middleware";
import {
  registerCustomerSchema,
  loginCustomerSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  addAddressSchema,
} from "./customer.validation";

const router = Router();
const controller = new CustomerController();

// Public auth routes
router.post(
  "/auth/register",
  authRateLimiter,
  validate(registerCustomerSchema),
  controller.register.bind(controller)
);

router.post(
  "/auth/login",
  authRateLimiter,
  validate(loginCustomerSchema),
  controller.login.bind(controller)
);

router.post(
  "/auth/refresh",
  validate(refreshTokenSchema),
  controller.refresh.bind(controller)
);

router.post(
  "/auth/forgot-password",
  validate(forgotPasswordSchema),
  controller.forgotPassword.bind(controller)
);

router.post(
  "/auth/reset-password",
  validate(resetPasswordSchema),
  controller.resetPassword.bind(controller)
);

router.get(
  "/auth/verify-email",
  validateQuery(resetPasswordSchema.pick({ token: true })),
  controller.verifyEmail.bind(controller)
);

// Protected profile routes
router.get("/profile", customerAuthenticate, controller.getProfile.bind(controller));

router.put(
  "/profile",
  customerAuthenticate,
  validate(updateProfileSchema),
  controller.updateProfile.bind(controller)
);

// Protected address routes
router.get("/addresses", customerAuthenticate, controller.getAddresses.bind(controller));

router.post(
  "/addresses",
  customerAuthenticate,
  validate(addAddressSchema),
  controller.addAddress.bind(controller)
);

export default router;

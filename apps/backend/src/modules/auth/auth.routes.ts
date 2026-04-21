import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { authRateLimiter, adminAuthRateLimiter } from "@/middlewares/rateLimit.middleware";
import { validate, validateQuery } from "@/middlewares/validate.middleware";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.validation";

const router = Router();
const controller = new AuthController();

router.post("/register", adminAuthRateLimiter, validate(registerSchema), controller.register.bind(controller));
router.post("/login", adminAuthRateLimiter, validate(loginSchema), controller.login.bind(controller));
router.post("/refresh", validate(refreshSchema), controller.refresh.bind(controller));
router.post("/logout", authenticate, controller.logout.bind(controller));
router.get("/verify-email", validateQuery(verifyEmailSchema), controller.verifyEmail.bind(controller));
router.post("/forgot-password", validate(forgotPasswordSchema), controller.forgotPassword.bind(controller));
router.post("/reset-password", validate(resetPasswordSchema), controller.resetPassword.bind(controller));

export default router;
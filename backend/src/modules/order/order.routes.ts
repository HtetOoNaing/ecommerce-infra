import { Router } from "express";
import { OrderController } from "./order.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";
import { validate, validateQuery } from "@/middlewares/validate.middleware";
import {
  createOrderSchema,
  updateOrderSchema,
  paginationQuerySchema,
} from "./order.validation";

const router = Router();
const controller = new OrderController();

// Admin routes
router.get(
  "/",
  authenticate,
  authorize(["admin"]),
  validateQuery(paginationQuerySchema),
  controller.getAll.bind(controller)
);

router.get(
  "/:id",
  authenticate,
  controller.getById.bind(controller)
);

router.get(
  "/user/:userId",
  authenticate,
  validateQuery(paginationQuerySchema),
  controller.getByUserId.bind(controller)
);

router.post(
  "/",
  authenticate,
  validate(createOrderSchema),
  controller.create.bind(controller)
);

router.put(
  "/:id",
  authenticate,
  authorize(["admin"]),
  validate(updateOrderSchema),
  controller.update.bind(controller)
);

router.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  controller.delete.bind(controller)
);

export default router;

import { Router } from "express";
import { CategoryController } from "./category.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";
import { validate, validateQuery } from "@/middlewares/validate.middleware";
import {
  createCategorySchema,
  updateCategorySchema,
  paginationQuerySchema,
} from "./category.validation";

const router = Router();
const controller = new CategoryController();

// Public routes
router.get("/", validateQuery(paginationQuerySchema), controller.getAll.bind(controller));
router.get("/:id", controller.getById.bind(controller));
router.get("/slug/:slug", controller.getBySlug.bind(controller));

// Admin only routes
router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  validate(createCategorySchema),
  controller.create.bind(controller)
);
router.put(
  "/:id",
  authenticate,
  authorize(["admin"]),
  validate(updateCategorySchema),
  controller.update.bind(controller)
);
router.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  controller.delete.bind(controller)
);

export default router;

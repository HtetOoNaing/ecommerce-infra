import { Router } from "express";
import { ProductController } from "./product.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { createProductSchema, updateProductSchema } from "./product.validation";

const router = Router();
const controller = new ProductController();

// Public — anyone can browse products
router.get("/", controller.getAll.bind(controller));
router.get("/:id", controller.getById.bind(controller));

// Protected — only authenticated admins can manage products
router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  validate(createProductSchema),
  controller.create.bind(controller)
);

router.put(
  "/:id",
  authenticate,
  authorize(["admin"]),
  validate(updateProductSchema),
  controller.update.bind(controller)
);

router.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  controller.delete.bind(controller)
);

export default router;

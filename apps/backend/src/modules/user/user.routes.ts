import { Router } from "express";
import { UserController } from "./user.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";
import { validate, validateQuery } from "@/middlewares/validate.middleware";
import { createUserSchema, paginationQuerySchema } from "./user.validation";

const router = Router();
const controller = new UserController();

router.post("/", authenticate, authorize(["admin"]), validate(createUserSchema), controller.create.bind(controller));
router.get("/", authenticate, authorize(["admin", "user"]), validateQuery(paginationQuerySchema), controller.getAll.bind(controller));

export default router;

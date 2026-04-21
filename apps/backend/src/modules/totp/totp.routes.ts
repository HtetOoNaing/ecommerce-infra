import { Router } from "express";
import { TotpController } from "./totp.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { totpVerifySchema } from "./totp.validation";

const router = Router();
const controller = new TotpController();

router.post("/setup", authenticate, controller.setup.bind(controller));
router.post("/enable", authenticate, validate(totpVerifySchema), controller.enable.bind(controller));
router.post("/disable", authenticate, validate(totpVerifySchema), controller.disable.bind(controller));

export default router;

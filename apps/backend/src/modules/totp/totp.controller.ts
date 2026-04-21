import { Response } from "express";
import { TotpService } from "./totp.service";
import { AuthRequest } from "@/middlewares/auth.middleware";

const service = new TotpService();

export class TotpController {
  async setup(req: AuthRequest, res: Response) {
    const result = await service.generateSetup(req.user!.id);
    res.json(result);
  }

  async enable(req: AuthRequest, res: Response) {
    await service.enableMfa(req.user!.id, req.body.token);
    res.json({ message: "MFA enabled successfully" });
  }

  async disable(req: AuthRequest, res: Response) {
    await service.disableMfa(req.user!.id, req.body.token);
    res.json({ message: "MFA disabled successfully" });
  }
}

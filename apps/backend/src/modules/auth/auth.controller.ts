import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { AuthRequest } from "@/middlewares/auth.middleware";
import { RequestWithId } from "@/middlewares/requestId.middleware";

const service = new AuthService();

export class AuthController {
  async register(req: RequestWithId, res: Response) {
    const result = await service.register(req.body, req.requestId);
    res.json(result);
  }

  async login(req: RequestWithId, res: Response) {
    const result = await service.login(req.body, req.requestId);
    res.json(result);
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;

    const result = await service.refresh(refreshToken);

    res.json(result);
  }

  async logout(req: AuthRequest, res: Response) {
    await service.logout(req.user!.id, req.user!.sessionId);

    res.clearCookie("refreshToken");

    res.json({ message: "Logged out successfully" });
  }

  async verifyEmail(req: Request, res: Response) {
    const { token } = req.query as { token: string };

    const result = await service.verifyEmail(token);

    res.json(result);
  }

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    await service.forgotPassword(email);

    res.json({ message: "If an account with that email exists, you will receive a password reset link." });
  }

  async resetPassword(req: Request, res: Response) {
    const { token, newPassword } = req.body;

    const result = await service.resetPassword(token, newPassword);

    res.json(result);
  }

}
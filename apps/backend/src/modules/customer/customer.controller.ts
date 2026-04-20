import { Request, Response } from "express";
import { CustomerService } from "./customer.service";

const service = new CustomerService();

export class CustomerController {
  async register(req: Request, res: Response) {
    const result = await service.register(req.body);
    res.status(201).json(result);
  }

  async login(req: Request, res: Response) {
    const result = await service.login(req.body.email, req.body.password);
    res.json(result);
  }

  async refresh(req: Request, res: Response) {
    const result = await service.refresh(req.body.refreshToken);
    res.json(result);
  }

  async forgotPassword(req: Request, res: Response) {
    await service.forgotPassword(req.body.email);
    res.json({ message: "If the email exists, a reset link has been sent" });
  }

  async resetPassword(req: Request, res: Response) {
    await service.resetPassword(req.body.token, req.body.newPassword);
    res.json({ message: "Password reset successful" });
  }

  async verifyEmail(req: Request, res: Response) {
    await service.verifyEmail(req.query.token as string);
    res.json({ message: "Email verified successfully" });
  }

  async getProfile(req: Request, res: Response) {
    const customerId = (req as any).customer.id;
    const result = await service.getProfile(customerId);
    res.json(result);
  }

  async updateProfile(req: Request, res: Response) {
    const customerId = (req as any).customer.id;
    const result = await service.updateProfile(customerId, req.body);
    res.json(result);
  }

  async getAddresses(req: Request, res: Response) {
    const customerId = (req as any).customer.id;
    const result = await service.getAddresses(customerId);
    res.json(result);
  }

  async addAddress(req: Request, res: Response) {
    const customerId = (req as any).customer.id;
    const result = await service.addAddress(customerId, req.body);
    res.status(201).json(result);
  }
}

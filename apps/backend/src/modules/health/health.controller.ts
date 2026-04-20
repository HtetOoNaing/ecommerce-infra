import { NextFunction, Request, Response } from "express";
import { HealthService } from "./health.service";

const service = new HealthService();
export class HealthController {
  async checkHealth(_req: Request, res: Response, next: NextFunction) {
    try {
      const health = await service.checkHealth();

      const statusCode = health.status === "healthy" ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (error) {
      next(error);
    }
  }
}

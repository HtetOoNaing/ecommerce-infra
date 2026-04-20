import { Response, NextFunction } from "express";
import { RequestWithId } from "./requestId.middleware";
import { logger } from "@/config/logger";

export const requestLogger = (
  req: RequestWithId,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    logger.info("HTTP Request", {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      ip: req.ip,
    });
  });

  next();
};
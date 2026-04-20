import { Response, NextFunction } from "express";
import { logger } from "@/config/logger";
import { RequestWithId } from "./requestId.middleware";

export const errorHandler = (
  err: any,
  req: RequestWithId,
  res: Response,
  _next: NextFunction
) => {
  logger.error("Unhandled error", {
    requestId: req.requestId,
    message: err.message,
    stack: err.stack,
  });

  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
};
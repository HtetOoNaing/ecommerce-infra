import { Request, Response, NextFunction } from "express";
import {
  httpRequestDuration,
  httpRequestTotal,
  activeConnections,
} from "@/modules/metrics/metrics.service";

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip metrics endpoint itself to avoid self-referential noise
  if (req.path === "/metrics") return next();

  activeConnections.inc();
  const end = httpRequestDuration.startTimer();

  res.on("finish", () => {
    const route = req.route?.path || req.path;
    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode.toString(),
    };

    end(labels);
    httpRequestTotal.inc(labels);
    activeConnections.dec();
  });

  next();
};

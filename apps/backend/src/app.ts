import express from "express";
import cors from "cors";
import userRoutes from "@/modules/user/user.routes";
import authRoutes from "@/modules/auth/auth.routes";
import productRoutes from "@/modules/product/product.routes";
import categoryRoutes from "@/modules/category/category.routes";
import orderRoutes from "@/modules/order/order.routes";
import healthRoutes from "@/modules/health/health.routes";
import customerRoutes from "@/modules/customer/customer.routes";
import { errorHandler } from "./middlewares/error.middleware";
import { connectDB } from "./config/db";
import { corsOptions } from "./middlewares/cors.middleware";
import { globalRateLimiter } from "./middlewares/rateLimit.middleware";
import { requestIdMiddleware } from "./middlewares/requestId.middleware";
import { requestLogger } from "./middlewares/logger.middleware";
import { metricsMiddleware } from "./middlewares/metrics.middleware";
import { register } from "@/modules/metrics/metrics.service";

const app = express();

// trust proxy MUST be set before any middleware that reads req.ip
// Behind nginx, req.ip is "172.18.0.x" (docker network) without this.
// With trust proxy, Express reads X-Forwarded-For header from nginx.
app.set("trust proxy", 1);

app.use(cors(corsOptions));
app.use(express.json());
app.use(metricsMiddleware);
app.use(requestIdMiddleware);
app.use(requestLogger);
app.use(globalRateLimiter);

// Versioned routes — /api/v1/ prefix
// This lets you ship breaking API changes as /api/v2/ without breaking existing clients
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/customer", customerRoutes);

// Health check — no rate limit, no auth (used by Docker healthcheck + load balancers)
app.use(healthRoutes);

// Prometheus metrics endpoint — scraped by Prometheus every 15s
app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

connectDB();

app.use(errorHandler);

export default app;
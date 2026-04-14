import "module-alias/register";
import "dotenv/config";
import app from "./app";
import { sequelize } from "./config/db";
import { redis } from "./config/redis";
import { logger } from "./config/logger";

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, { env: process.env.NODE_ENV });
});

// --- Graceful shutdown ---
// Docker sends SIGTERM when stopping a container.
// We must close connections cleanly or risk data corruption.
const shutdown = async (signal: string) => {
  logger.info(`${signal} received — shutting down gracefully`);

  server.close(() => {
    logger.info("HTTP server closed");
  });

  try {
    await sequelize.close();
    logger.info("Database connection closed");
  } catch (err) {
    logger.error("Error closing database", { error: err });
  }

  try {
    await redis.quit();
    logger.info("Redis connection closed");
  } catch (err) {
    logger.error("Error closing Redis", { error: err });
  }

  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
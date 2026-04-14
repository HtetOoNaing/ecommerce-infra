import "module-alias/register";
import "dotenv/config";
import "./jobs/workers/email.worker";
import { logger } from "./config/logger";

logger.info("Worker started");

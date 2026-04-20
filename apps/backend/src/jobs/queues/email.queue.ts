import { redis } from "@/config/redis";
import { Queue } from "bullmq";

export const emailQueue = new Queue("email-queue", {
  connection: redis
});
import { Worker } from "bullmq";
import { redis } from "@/config/redis";
import { sendEmail } from "@/services/email.service";

export const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    const { to, subject, html } = job.data;

    console.log("📩 Processing email job:", to);

    await sendEmail(to, subject, html);
  },
  {
    connection: redis,
  }
);

emailWorker.on("completed", (job) => {
  console.log(`✅ Email job completed: ${job.id}`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`❌ Email job failed: ${job?.id}`, err);
});
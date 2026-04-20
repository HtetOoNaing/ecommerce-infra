import { emailQueue } from "../queues/email.queue";

interface SendEmailJob {
  to: string;
  subject: string;
  html: string;
}

export const addEmailJob = async (data: SendEmailJob) => {
  await emailQueue.add("send-email", data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
  });
}
const mockAdd = jest.fn().mockResolvedValue({});

jest.mock("@/jobs/queues/email.queue", () => ({
  emailQueue: { add: mockAdd },
}));

import { addEmailJob } from "@/jobs/producers/email.producer";

describe("email.producer — addEmailJob", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should add a send-email job to the queue", async () => {
    const data = {
      to: "user@test.com",
      subject: "Welcome",
      html: "<p>Hello</p>",
    };

    await addEmailJob(data);

    expect(mockAdd).toHaveBeenCalledWith("send-email", data, {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: true,
    });
  });

  it("should propagate queue errors", async () => {
    mockAdd.mockRejectedValueOnce(new Error("Queue error"));

    await expect(
      addEmailJob({ to: "a@b.com", subject: "x", html: "y" })
    ).rejects.toThrow("Queue error");
  });
});

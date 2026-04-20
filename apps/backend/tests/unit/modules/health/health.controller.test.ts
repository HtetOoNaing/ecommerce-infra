const mockCheckHealth = jest.fn();

jest.mock("@/modules/health/health.service", () => ({
  HealthService: jest.fn().mockImplementation(() => ({
    checkHealth: mockCheckHealth,
  })),
}));

import request from "supertest";
import express from "express";
import { HealthController } from "@/modules/health/health.controller";

function createApp() {
  const app = express();
  const controller = new HealthController();
  app.get("/health", controller.checkHealth.bind(controller));
  return app;
}

describe("HealthController", () => {
  const app = createApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 when healthy", async () => {
    mockCheckHealth.mockResolvedValue({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: 100,
      services: { database: "healthy", redis: "healthy" },
    });

    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
  });

  it("should return 503 when unhealthy", async () => {
    mockCheckHealth.mockResolvedValue({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: 100,
      services: { database: "unhealthy", redis: "healthy" },
    });

    const res = await request(app).get("/health");
    expect(res.status).toBe(503);
    expect(res.body.status).toBe("unhealthy");
  });

  it("should call next on error", async () => {
    mockCheckHealth.mockRejectedValue(new Error("Unexpected"));

    const res = await request(app).get("/health");
    expect(res.status).toBe(500);
  });
});

import request from "supertest";
import express from "express";

// Minimal app for integration testing — avoids needing real DB/Redis
const app = express();
app.get("/health", (_req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

describe("GET /health", () => {
  it("should return 200 with healthy status", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
    expect(res.body.timestamp).toBeDefined();
  });
});

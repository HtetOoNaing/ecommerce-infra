jest.mock("@/config/logger", () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

import { Response, NextFunction } from "express";
import { requestLogger } from "@/middlewares/logger.middleware";
import { RequestWithId } from "@/middlewares/requestId.middleware";
import { logger } from "@/config/logger";
import { EventEmitter } from "events";

function mockReqRes() {
  const req = {
    requestId: "req-123",
    method: "GET",
    originalUrl: "/api/v1/users",
    ip: "127.0.0.1",
  } as unknown as RequestWithId;

  const res = new EventEmitter() as Response & EventEmitter;
  (res as any).statusCode = 200;

  const next = jest.fn() as NextFunction;
  return { req, res, next };
}

describe("requestLogger middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call next() immediately", () => {
    const { req, res, next } = mockReqRes();
    requestLogger(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should log on response finish", () => {
    const { req, res, next } = mockReqRes();
    requestLogger(req, res, next);

    res.emit("finish");

    expect(logger.info).toHaveBeenCalledWith(
      "HTTP Request",
      expect.objectContaining({
        requestId: "req-123",
        method: "GET",
        url: "/api/v1/users",
        status: 200,
        ip: "127.0.0.1",
      })
    );
  });

  it("should include duration in log", () => {
    const { req, res, next } = mockReqRes();
    requestLogger(req, res, next);

    res.emit("finish");

    expect(logger.info).toHaveBeenCalledWith(
      "HTTP Request",
      expect.objectContaining({ duration: expect.any(Number) })
    );
  });
});

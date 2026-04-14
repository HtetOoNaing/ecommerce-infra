const mockInc = jest.fn();
const mockDec = jest.fn();
const mockStartTimer = jest.fn(() => jest.fn());

jest.mock("@/modules/metrics/metrics.service", () => ({
  httpRequestDuration: { startTimer: mockStartTimer },
  httpRequestTotal: { inc: mockInc },
  activeConnections: { inc: mockInc, dec: mockDec },
}));

import { Request, Response, NextFunction } from "express";
import { metricsMiddleware } from "@/middlewares/metrics.middleware";
import { EventEmitter } from "events";

function mockReqRes(path: string) {
  const req = { path, method: "GET", route: { path } } as unknown as Request;
  const res = new EventEmitter() as Response & EventEmitter;
  (res as any).statusCode = 200;
  const next = jest.fn() as NextFunction;
  return { req, res, next };
}

describe("metricsMiddleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should skip /metrics path", () => {
    const { req, res, next } = mockReqRes("/metrics");
    metricsMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(mockStartTimer).not.toHaveBeenCalled();
  });

  it("should call next() for non-metrics paths", () => {
    const { req, res, next } = mockReqRes("/api/v1/users");
    metricsMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should increment activeConnections on request", () => {
    const { req, res, next } = mockReqRes("/api/v1/users");
    metricsMiddleware(req, res, next);
    expect(mockInc).toHaveBeenCalled();
  });

  it("should record metrics on response finish", () => {
    const endTimer = jest.fn();
    mockStartTimer.mockReturnValueOnce(endTimer);

    const { req, res, next } = mockReqRes("/api/v1/users");
    metricsMiddleware(req, res, next);

    res.emit("finish");

    expect(endTimer).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        route: "/api/v1/users",
        status_code: "200",
      })
    );
    expect(mockDec).toHaveBeenCalled();
  });
});

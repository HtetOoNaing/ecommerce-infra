jest.mock("@/modules/audit-log/audit-log.service", () => ({
  AuditLogService: jest.fn().mockImplementation(() => ({
    log: jest.fn().mockResolvedValue(undefined),
  })),
}));

import { Request, Response, NextFunction } from "express";
import { auditLog } from "@/middlewares/auditLog.middleware";
import { AuditLogService } from "@/modules/audit-log/audit-log.service";

function makeMockRes(statusCode = 200): Response {
  const res: Partial<Response> = {
    statusCode,
    on: jest.fn((event: string, cb: () => void) => {
      if (event === "finish") cb();
      return res as Response;
    }),
  };
  return res as Response;
}

function makeMockReq(
  method: string,
  path: string,
  userId?: number
): Request {
  return {
    method,
    path,
    ip: "127.0.0.1",
    headers: { "user-agent": "jest-test" },
    user: userId ? { id: userId, email: "admin@test.com", role: "admin", sessionId: "s1" } : undefined,
  } as unknown as Request;
}

describe("auditLog middleware", () => {
  let logMock: jest.Mock;

  beforeAll(() => {
    // AuditLogService is created at auditLog.middleware.ts module level.
    // Capture the singleton instance before clearAllMocks() wipes mock.instances.
    const instance = jest.mocked(AuditLogService).mock.results[0]!.value as jest.Mocked<InstanceType<typeof AuditLogService>>;
    logMock = instance?.log as jest.Mock;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls next() for all methods", () => {
    const next = jest.fn() as NextFunction;
    auditLog(makeMockReq("POST", "/api/v1/products") as never, makeMockRes(), next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("logs CREATE action for POST on success (2xx)", () => {
    const next = jest.fn() as NextFunction;
    auditLog(makeMockReq("POST", "/api/v1/products", 42) as never, makeMockRes(201), next);
    expect(logMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "CREATE", resource: "products", adminId: 42 })
    );
  });

  it("logs UPDATE action for PUT", () => {
    const next = jest.fn() as NextFunction;
    auditLog(makeMockReq("PUT", "/api/v1/products/7", 1) as never, makeMockRes(200), next);
    expect(logMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "UPDATE", resource: "products", resourceId: "7" })
    );
  });

  it("logs DELETE action for DELETE", () => {
    const next = jest.fn() as NextFunction;
    auditLog(makeMockReq("DELETE", "/api/v1/products/3", 1) as never, makeMockRes(204), next);
    expect(logMock).toHaveBeenCalledWith(
      expect.objectContaining({ action: "DELETE", resource: "products", resourceId: "3" })
    );
  });

  it("does NOT log when response status is 4xx", () => {
    const next = jest.fn() as NextFunction;
    auditLog(makeMockReq("POST", "/api/v1/products", 1) as never, makeMockRes(400), next);
    expect(logMock).not.toHaveBeenCalled();
  });

  it("does NOT log for GET requests", () => {
    const next = jest.fn() as NextFunction;
    auditLog(makeMockReq("GET", "/api/v1/products") as never, makeMockRes(200), next);
    expect(logMock).not.toHaveBeenCalled();
  });

  it("sets adminId to null when user is not authenticated", () => {
    const next = jest.fn() as NextFunction;
    auditLog(makeMockReq("POST", "/api/v1/products") as never, makeMockRes(201), next);
    expect(logMock).toHaveBeenCalledWith(
      expect.objectContaining({ adminId: null })
    );
  });
});

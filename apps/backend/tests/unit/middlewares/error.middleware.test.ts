import { Response, NextFunction } from "express";
import { errorHandler } from "@/middlewares/error.middleware";
import { RequestWithId } from "@/middlewares/requestId.middleware";

// Mock logger to avoid file I/O in tests
jest.mock("@/config/logger", () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

function mockReqResNext() {
  const req = { requestId: "req-123" } as RequestWithId;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  const next = jest.fn() as NextFunction;
  return { req, res, next };
}

describe("errorHandler middleware", () => {
  it("should respond with error status and message from AppError-like object", () => {
    const { req, res, next } = mockReqResNext();
    const err = { status: 404, message: "Not found", stack: "" };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Not found" });
  });

  it("should default to 500 when no status on error", () => {
    const { req, res, next } = mockReqResNext();
    const err = { message: "Something broke", stack: "" };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("should default message when error has no message", () => {
    const { req, res, next } = mockReqResNext();
    const err = { stack: "" };

    errorHandler(err, req, res, next);

    expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
  });
});

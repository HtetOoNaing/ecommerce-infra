jest.mock("uuid", () => ({
  v4: jest.fn(() => "550e8400-e29b-41d4-a716-446655440000"),
}));

import { Response, NextFunction } from "express";
import { requestIdMiddleware, RequestWithId } from "@/middlewares/requestId.middleware";

describe("requestId middleware", () => {
  it("should attach a requestId to req and call next()", () => {
    const req = {} as RequestWithId;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    requestIdMiddleware(req, res, next);

    expect(req.requestId).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(next).toHaveBeenCalled();
  });

  it("should call uuid v4 for each request", () => {
    const { v4 } = require("uuid");
    (v4 as jest.Mock)
      .mockReturnValueOnce("aaaa-1111")
      .mockReturnValueOnce("bbbb-2222");

    const req1 = {} as RequestWithId;
    const req2 = {} as RequestWithId;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    requestIdMiddleware(req1, res, next);
    requestIdMiddleware(req2, res, next);

    expect(req1.requestId).toBe("aaaa-1111");
    expect(req2.requestId).toBe("bbbb-2222");
    expect(req1.requestId).not.toBe(req2.requestId);
  });
});

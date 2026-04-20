import { Response, NextFunction } from "express";
import { authorize } from "@/middlewares/role.middleware";
import { AuthRequest } from "@/middlewares/auth.middleware";

function mockReqResNext(user?: { id: number; email: string; role: "user" | "admin"; sessionId: string }) {
  const req = { user } as AuthRequest;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  const next = jest.fn() as NextFunction;
  return { req, res, next };
}

describe("authorize middleware", () => {
  it("should call next() when user role is in allowed roles", () => {
    const { req, res, next } = mockReqResNext({
      id: 1, email: "a@b.com", role: "admin", sessionId: "s1",
    });
    authorize(["admin"])(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should return 403 when user role is not in allowed roles", () => {
    const { req, res, next } = mockReqResNext({
      id: 1, email: "a@b.com", role: "user", sessionId: "s1",
    });
    authorize(["admin"])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
  });

  it("should return 401 when no user is attached", () => {
    const { req, res, next } = mockReqResNext(undefined);
    authorize(["admin"])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
  });

  it("should allow multiple roles", () => {
    const { req, res, next } = mockReqResNext({
      id: 1, email: "a@b.com", role: "user", sessionId: "s1",
    });
    authorize(["user", "admin"])(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

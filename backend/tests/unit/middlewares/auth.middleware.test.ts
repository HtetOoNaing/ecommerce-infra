import { Response, NextFunction } from "express";
import { authenticate, AuthRequest } from "@/middlewares/auth.middleware";
import { signAccessToken, JwtPayload } from "@/utils/jwt";

function mockReqResNext(authHeader?: string) {
  const req = {
    headers: { authorization: authHeader },
  } as unknown as AuthRequest;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  const next = jest.fn() as NextFunction;
  return { req, res, next };
}

const testPayload: JwtPayload = {
  id: 42,
  email: "test@test.com",
  role: "admin",
  sessionId: "sess-abc",
};

describe("authenticate middleware", () => {
  it("should attach user and call next() with valid token", () => {
    const token = signAccessToken(testPayload);
    const { req, res, next } = mockReqResNext(`Bearer ${token}`);

    authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user!.id).toBe(42);
    expect(req.user!.email).toBe("test@test.com");
  });

  it("should return 401 when no Authorization header", () => {
    const { req, res, next } = mockReqResNext(undefined);

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 when header does not start with Bearer", () => {
    const { req, res, next } = mockReqResNext("Token abc");

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should return 401 for invalid/tampered token", () => {
    const { req, res, next } = mockReqResNext("Bearer invalid.token.here");

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid or expired token" });
  });
});

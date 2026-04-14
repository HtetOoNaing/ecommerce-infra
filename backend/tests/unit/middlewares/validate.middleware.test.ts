import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validate, validateQuery } from "@/middlewares/validate.middleware";

function mockReqResNext(body: any) {
  const req = { body } as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  const next = jest.fn() as NextFunction;
  return { req, res, next };
}

const schema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
});

describe("validate middleware", () => {
  it("should call next() for valid body", () => {
    const { req, res, next } = mockReqResNext({ name: "Widget", price: 9.99 });
    validate(schema)(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should return 400 for invalid body", () => {
    const { req, res, next } = mockReqResNext({ name: "", price: -1 });
    validate(schema)(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Validation error" })
    );
  });

  it("should return 400 for missing required fields", () => {
    const { req, res, next } = mockReqResNext({});
    validate(schema)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

function mockQueryReqResNext(query: any) {
  const req = { query } as unknown as Request;
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  const next = jest.fn() as NextFunction;
  return { req, res, next };
}

const querySchema = z.object({
  token: z.string().min(1),
});

describe("validateQuery middleware", () => {
  it("should call next() for valid query params", () => {
    const { req, res, next } = mockQueryReqResNext({ token: "abc123" });
    validateQuery(querySchema)(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should return 400 for missing query params", () => {
    const { req, res, next } = mockQueryReqResNext({});
    validateQuery(querySchema)(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Validation error" })
    );
  });

  it("should return 400 for invalid query params", () => {
    const { req, res, next } = mockQueryReqResNext({ token: "" });
    validateQuery(querySchema)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

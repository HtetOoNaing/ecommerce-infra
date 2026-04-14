import { AppError } from "@/utils/appError";

describe("AppError", () => {
  it("should create an error with status and message", () => {
    const error = new AppError("Something failed", 400);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe("Something failed");
    expect(error.status).toBe(400);
    expect(error.isOperational).toBe(true);
  });

  it("should mark internal errors as non-operational", () => {
    const error = AppError.internal("DB crashed");

    expect(error.status).toBe(500);
    expect(error.isOperational).toBe(false);
  });

  describe("static factory methods", () => {
    it("badRequest → 400", () => {
      const err = AppError.badRequest("Invalid input");
      expect(err.status).toBe(400);
      expect(err.message).toBe("Invalid input");
    });

    it("unauthorized → 401", () => {
      const err = AppError.unauthorized();
      expect(err.status).toBe(401);
      expect(err.message).toBe("Unauthorized");
    });

    it("forbidden → 403", () => {
      const err = AppError.forbidden();
      expect(err.status).toBe(403);
    });

    it("notFound → 404", () => {
      const err = AppError.notFound("Product not found");
      expect(err.status).toBe(404);
      expect(err.message).toBe("Product not found");
    });

    it("conflict → 409", () => {
      const err = AppError.conflict("SKU already exists");
      expect(err.status).toBe(409);
    });
  });
});

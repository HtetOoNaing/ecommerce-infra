import { Request, Response, NextFunction } from "express";
import { verifyCustomerAccessToken, CustomerJwtPayload } from "@/utils/customer-jwt";
import { AppError } from "@/utils/appError";

export interface CustomerAuthRequest extends Request {
  customer: CustomerJwtPayload;
}

export const customerAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw AppError.unauthorized("Authorization header required");
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyCustomerAccessToken(token);
    (req as CustomerAuthRequest).customer = payload;
    next();
  } catch {
    throw AppError.unauthorized("Invalid or expired token");
  }
};

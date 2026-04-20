import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "@/config/env";

export interface CustomerJwtPayload {
  id: number;
  email: string;
  sessionId: string;
}

export const signCustomerAccessToken = (payload: CustomerJwtPayload) => {
  return jwt.sign(payload, env.CUSTOMER_JWT_ACCESS_SECRET, {
    expiresIn: env.CUSTOMER_ACCESS_TOKEN_EXPIRES as SignOptions["expiresIn"],
  });
};

export const signCustomerRefreshToken = (payload: CustomerJwtPayload) => {
  return jwt.sign(payload, env.CUSTOMER_JWT_REFRESH_SECRET, {
    expiresIn: env.CUSTOMER_REFRESH_TOKEN_EXPIRES as SignOptions["expiresIn"],
  });
};

export const verifyCustomerAccessToken = (token: string): CustomerJwtPayload => {
  return jwt.verify(token, env.CUSTOMER_JWT_ACCESS_SECRET) as CustomerJwtPayload;
};

export const verifyCustomerRefreshToken = (token: string): CustomerJwtPayload => {
  return jwt.verify(token, env.CUSTOMER_JWT_REFRESH_SECRET) as CustomerJwtPayload;
};

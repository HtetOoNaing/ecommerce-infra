import dotenv from "dotenv";

dotenv.config();

function getEnv(key: string, required = true): string {
  const value = process.env[key];

  if (!value && required) {
    throw new Error(`❌ Missing environment variable: ${key}`);
  }

  return value as string;
}

export const env = {
  NODE_ENV: getEnv("NODE_ENV", false) || "development",
  PORT: parseInt(getEnv("PORT", false) || "4000", 10),
  DATABASE_URL: getEnv("DATABASE_URL"),
  REDIS_URL: getEnv("REDIS_URL"),
  JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
  ACCESS_TOKEN_EXPIRES: getEnv("ACCESS_TOKEN_EXPIRES", false) || "15m",
  REFRESH_TOKEN_EXPIRES: getEnv("REFRESH_TOKEN_EXPIRES", false) || "7d",
  // Customer JWT secrets (Phase 2)
  CUSTOMER_JWT_ACCESS_SECRET: getEnv("CUSTOMER_JWT_ACCESS_SECRET"),
  CUSTOMER_JWT_REFRESH_SECRET: getEnv("CUSTOMER_JWT_REFRESH_SECRET"),
  CUSTOMER_ACCESS_TOKEN_EXPIRES: getEnv("CUSTOMER_ACCESS_TOKEN_EXPIRES", false) || "15m",
  CUSTOMER_REFRESH_TOKEN_EXPIRES: getEnv("CUSTOMER_REFRESH_TOKEN_EXPIRES", false) || "30d",
  // Stripe (Phase 4)
  STRIPE_SECRET_KEY: getEnv("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: getEnv("STRIPE_WEBHOOK_SECRET"),
};
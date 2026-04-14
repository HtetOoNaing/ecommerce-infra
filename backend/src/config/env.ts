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
};
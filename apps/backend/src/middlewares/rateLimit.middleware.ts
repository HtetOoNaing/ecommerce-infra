import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redis } from "@/config/redis";

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // 100 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(args[0], ...args.slice(1)) as Promise<any>,
  }),

  windowMs: 15 * 60 * 1000,
  max: 5,

  // Use req.ip directly — express-rate-limit handles IPv6 normalization
  // when we don't provide a custom keyGenerator
  keyGenerator: undefined,

  message: {
    message: "Too many attempts. Try again later.",
  },
});

export const adminAuthRateLimiter = rateLimit({
  store: new RedisStore({
    prefix: "rl:admin:auth:",
    sendCommand: (...args: string[]) => redis.call(args[0], ...args.slice(1)) as Promise<any>,
  }),

  windowMs: 15 * 60 * 1000,
  max: 3,

  keyGenerator: undefined,

  message: {
    message: "Too many admin login attempts. Try again in 15 minutes.",
  },
});
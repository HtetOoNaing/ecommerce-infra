import { redis } from "@/config/redis";

export class RedisService {
  async ping() {
    return redis.ping();
  }
  async set(key: string, value: string, ttl?: number) {
    if (ttl) {
      return redis.set(key, value, "EX", ttl);
    }
    return redis.set(key, value);
  }

  async get(key: string) {
    return redis.get(key);
  }

  async delete(key: string) {
    return redis.del(key);
  }

  async deleteAll(keys: string[]) {
    if (keys.length === 0) return 0;
    return redis.del(...keys);
  }

  async getKeys(pattern: string): Promise<string[]> {
    const stream = redis.scanStream({ match: pattern });
    const keys: string[] = [];

    try {
      for await (const resultKeys of stream as AsyncIterable<string[]>) {
        keys.push(...resultKeys);
      }
    } catch (err) {
      console.error("Redis scan error:", err);
      throw err;
    }

    return keys;
  }

}

export const redisService = new RedisService();
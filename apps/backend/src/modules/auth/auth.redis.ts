import { redisService } from "@/services/redis.service";
import { hours } from "@/utils/time";

const REFRESH_PREFIX = "admin:session";

export const setRefreshToken = (userId: number, sessionId: string, token: string) => {
  return redisService.set(
    `${REFRESH_PREFIX}:${userId}:${sessionId}`,
    token,
    hours(1)
  );
};

export const getRefreshToken = (userId: number, sessionId: string) => {
  return redisService.get(`${REFRESH_PREFIX}:${userId}:${sessionId}`);
};

export const deleteRefreshToken = (userId: number, sessionId: string) => {
  return redisService.delete(`${REFRESH_PREFIX}:${userId}:${sessionId}`);
};

export const logoutAll = async (userId: number) => {
  const keys = await redisService.getKeys(`${REFRESH_PREFIX}:${userId}:*`);

  if (keys.length > 0) {
    await redisService.deleteAll(keys);
  }
}
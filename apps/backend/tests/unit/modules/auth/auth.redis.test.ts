const mockSet = jest.fn().mockResolvedValue("OK");
const mockGet = jest.fn().mockResolvedValue("stored-token");
const mockDelete = jest.fn().mockResolvedValue(1);
const mockGetKeys = jest.fn().mockResolvedValue([]);
const mockDeleteAll = jest.fn().mockResolvedValue(0);

jest.mock("@/services/redis.service", () => ({
  redisService: {
    set: mockSet,
    get: mockGet,
    delete: mockDelete,
    getKeys: mockGetKeys,
    deleteAll: mockDeleteAll,
  },
}));

import {
  setRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
  logoutAll,
} from "@/modules/auth/auth.redis";

describe("auth.redis", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("setRefreshToken", () => {
    it("should store a refresh token with correct key and TTL", async () => {
      await setRefreshToken(1, "session-abc", "jwt-token");

      expect(mockSet).toHaveBeenCalledWith(
        "admin:session:1:session-abc",
        "jwt-token",
        3600 // 1 hour admin session
      );
    });
  });

  describe("getRefreshToken", () => {
    it("should retrieve a refresh token by userId and sessionId", async () => {
      const result = await getRefreshToken(1, "session-abc");

      expect(mockGet).toHaveBeenCalledWith("admin:session:1:session-abc");
      expect(result).toBe("stored-token");
    });
  });

  describe("deleteRefreshToken", () => {
    it("should delete a refresh token by userId and sessionId", async () => {
      await deleteRefreshToken(1, "session-abc");

      expect(mockDelete).toHaveBeenCalledWith("admin:session:1:session-abc");
    });
  });

  describe("logoutAll", () => {
    it("should delete all tokens for a user when keys exist", async () => {
      mockGetKeys.mockResolvedValueOnce([
        "admin:session:1:s1",
        "admin:session:1:s2",
      ]);

      await logoutAll(1);

      expect(mockGetKeys).toHaveBeenCalledWith("admin:session:1:*");
      expect(mockDeleteAll).toHaveBeenCalledWith([
        "admin:session:1:s1",
        "admin:session:1:s2",
      ]);
    });

    it("should not call deleteAll when no keys exist", async () => {
      mockGetKeys.mockResolvedValueOnce([]);

      await logoutAll(1);

      expect(mockGetKeys).toHaveBeenCalledWith("admin:session:1:*");
      expect(mockDeleteAll).not.toHaveBeenCalled();
    });
  });
});

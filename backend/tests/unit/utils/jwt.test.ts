import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken, JwtPayload } from "@/utils/jwt";

const mockPayload: JwtPayload = {
  id: 1,
  email: "test@example.com",
  role: "admin",
  sessionId: "sess-123",
};

describe("JWT Utils", () => {
  describe("signAccessToken / verifyAccessToken", () => {
    it("should sign and verify an access token", () => {
      const token = signAccessToken(mockPayload);
      expect(typeof token).toBe("string");

      const decoded = verifyAccessToken(token);
      expect(decoded.id).toBe(mockPayload.id);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
      expect(decoded.sessionId).toBe(mockPayload.sessionId);
    });

    it("should throw on tampered token", () => {
      const token = signAccessToken(mockPayload);
      expect(() => verifyAccessToken(token + "x")).toThrow();
    });
  });

  describe("signRefreshToken / verifyRefreshToken", () => {
    it("should sign and verify a refresh token", () => {
      const token = signRefreshToken(mockPayload);
      const decoded = verifyRefreshToken(token);

      expect(decoded.id).toBe(mockPayload.id);
      expect(decoded.email).toBe(mockPayload.email);
    });

    it("should throw when verifying access token as refresh token", () => {
      const accessToken = signAccessToken(mockPayload);
      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });
  });
});

import { generateToken, hashToken } from "@/utils/token";

describe("Token Utils", () => {
  describe("generateToken", () => {
    it("should return a 64-char hex string", () => {
      const token = generateToken();
      expect(token).toHaveLength(64);
      expect(token).toMatch(/^[a-f0-9]+$/);
    });

    it("should produce unique tokens each call", () => {
      const a = generateToken();
      const b = generateToken();
      expect(a).not.toBe(b);
    });
  });

  describe("hashToken", () => {
    it("should return a 64-char SHA-256 hex digest", () => {
      const hash = hashToken("test-token");
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });

    it("should be deterministic (same input → same output)", () => {
      const h1 = hashToken("abc");
      const h2 = hashToken("abc");
      expect(h1).toBe(h2);
    });

    it("should produce different hashes for different inputs", () => {
      const h1 = hashToken("token-a");
      const h2 = hashToken("token-b");
      expect(h1).not.toBe(h2);
    });
  });
});

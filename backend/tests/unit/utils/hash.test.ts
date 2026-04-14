import { hashPassword, comparePassword } from "@/utils/hash";

describe("Hash Utils", () => {
  const plainPassword = "S3cureP@ss!";

  describe("hashPassword", () => {
    it("should return a bcrypt hash string", async () => {
      const hash = await hashPassword(plainPassword);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(plainPassword);
      expect(hash.startsWith("$2b$")).toBe(true);
    });

    it("should produce different hashes for same input (salt)", async () => {
      const h1 = await hashPassword(plainPassword);
      const h2 = await hashPassword(plainPassword);
      expect(h1).not.toBe(h2);
    });
  });

  describe("comparePassword", () => {
    it("should return true for matching password", async () => {
      const hash = await hashPassword(plainPassword);
      const result = await comparePassword(plainPassword, hash);
      expect(result).toBe(true);
    });

    it("should return false for wrong password", async () => {
      const hash = await hashPassword(plainPassword);
      const result = await comparePassword("wrong-password", hash);
      expect(result).toBe(false);
    });
  });
});

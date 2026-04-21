// --- Mock fns declared before jest.mock so hoisted factories can reference them ---
const mockFindByEmail = jest.fn();
const mockCreateUser = jest.fn();
const mockFindByVerificationToken = jest.fn();
const mockFindById = jest.fn();
const mockFindValidResetToken = jest.fn();

jest.mock("@/modules/user/user.service", () => ({
  UserService: jest.fn().mockImplementation(() => ({
    findByEmail: mockFindByEmail,
    createUser: mockCreateUser,
    findByVerificationToken: mockFindByVerificationToken,
    findById: mockFindById,
    findValidResetToken: mockFindValidResetToken,
  })),
}));
jest.mock("@/modules/auth/auth.redis");
jest.mock("@/utils/jwt");
jest.mock("@/utils/token");
jest.mock("@/utils/hash");
jest.mock("@/jobs/producers/email.producer");
jest.mock("@/config/logger", () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));
jest.mock("bcrypt");
jest.mock("uuid", () => ({ v4: () => "mock-uuid-v4" }));

import { AuthService } from "@/modules/auth/auth.service";
import * as authRedis from "@/modules/auth/auth.redis";
import * as jwt from "@/utils/jwt";
import * as tokenUtils from "@/utils/token";
import * as hashUtils from "@/utils/hash";
import * as emailProducer from "@/jobs/producers/email.producer";
import bcrypt from "bcrypt";

const setRefreshToken = authRedis.setRefreshToken as jest.MockedFunction<typeof authRedis.setRefreshToken>;
const getRefreshToken = authRedis.getRefreshToken as jest.MockedFunction<typeof authRedis.getRefreshToken>;
const deleteRefreshToken = authRedis.deleteRefreshToken as jest.MockedFunction<typeof authRedis.deleteRefreshToken>;
const signAccessToken = jwt.signAccessToken as jest.MockedFunction<typeof jwt.signAccessToken>;
const signRefreshToken = jwt.signRefreshToken as jest.MockedFunction<typeof jwt.signRefreshToken>;
const verifyRefreshToken = jwt.verifyRefreshToken as jest.MockedFunction<typeof jwt.verifyRefreshToken>;
const generateToken = tokenUtils.generateToken as jest.MockedFunction<typeof tokenUtils.generateToken>;
const hashToken = tokenUtils.hashToken as jest.MockedFunction<typeof tokenUtils.hashToken>;
const hashPassword = hashUtils.hashPassword as jest.MockedFunction<typeof hashUtils.hashPassword>;
const comparePassword = hashUtils.comparePassword as jest.MockedFunction<typeof hashUtils.comparePassword>;
const addEmailJob = emailProducer.addEmailJob as jest.MockedFunction<typeof emailProducer.addEmailJob>;

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
    signAccessToken.mockReturnValue("access-token");
    signRefreshToken.mockReturnValue("refresh-token");
    setRefreshToken.mockResolvedValue(undefined as any);
    generateToken.mockReturnValue("raw-verify-token");
    hashToken.mockReturnValue("hashed-verify-token");
    hashPassword.mockResolvedValue("hashed-pw");
    comparePassword.mockResolvedValue(true);
    addEmailJob.mockResolvedValue(undefined as any);
  });

  describe("register", () => {
    it("should register a new user and return tokens", async () => {
      mockFindByEmail.mockResolvedValue(null);
      mockCreateUser.mockResolvedValue({
        id: 1, email: "new@test.com", role: "user", name: "New",
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-pw");

      const result = await service.register({
        email: "new@test.com",
        password: "pass123",
        name: "New",
      });

      expect(mockFindByEmail).toHaveBeenCalledWith("new@test.com");
      expect(mockCreateUser).toHaveBeenCalled();
      expect(result.accessToken).toBe("access-token");
      expect(result.refreshToken).toBe("refresh-token");
      expect(setRefreshToken).toHaveBeenCalled();
      expect(addEmailJob).toHaveBeenCalled();
    });

    it("should throw when user already exists", async () => {
      mockFindByEmail.mockResolvedValue({ id: 1 });

      await expect(
        service.register({ email: "dup@test.com", password: "pass" })
      ).rejects.toThrow("User already exists");
    });
  });

  describe("login", () => {
    it("should return tokens for valid credentials", async () => {
      const mockUser = {
        id: 1,
        email: "test@test.com",
        password: "hashed-pw",
        role: "user" as const,
        name: "Test",
        isVerified: true,
      };
      mockFindByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: "test@test.com",
        password: "pass",
      });

      expect(result.accessToken).toBe("access-token");
      expect(result.user!.email).toBe("test@test.com");
    });

    it("should throw for invalid email", async () => {
      mockFindByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: "bad@test.com", password: "pass" })
      ).rejects.toThrow("Invalid credentials");
    });

    it("should throw for unverified user", async () => {
      mockFindByEmail.mockResolvedValue({
        id: 1, email: "test@test.com", password: "hashed", isVerified: false,
      });

      await expect(
        service.login({ email: "test@test.com", password: "pass" })
      ).rejects.toThrow("Please verify your email first");
    });

    it("should throw for wrong password", async () => {
      mockFindByEmail.mockResolvedValue({
        id: 1, email: "test@test.com", password: "hashed", isVerified: true, role: "user",
      });
      comparePassword.mockResolvedValue(false);

      await expect(
        service.login({ email: "test@test.com", password: "wrong" })
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("refresh", () => {
    it("should rotate tokens on valid refresh", async () => {
      verifyRefreshToken.mockReturnValue({
        id: 1, email: "t@t.com", role: "user", sessionId: "s1",
      });
      getRefreshToken.mockResolvedValue("refresh-token");
      deleteRefreshToken.mockResolvedValue(undefined as any);
      signAccessToken.mockReturnValue("new-access");
      signRefreshToken.mockReturnValue("new-refresh");

      const result = await service.refresh("refresh-token");

      expect(deleteRefreshToken).toHaveBeenCalled();
      expect(setRefreshToken).toHaveBeenCalled();
      expect(result.accessToken).toBe("new-access");
      expect(result.refreshToken).toBe("new-refresh");
    });

    it("should throw and delete token on mismatch (replay attack)", async () => {
      verifyRefreshToken.mockReturnValue({
        id: 1, email: "t@t.com", role: "user", sessionId: "s1",
      });
      getRefreshToken.mockResolvedValue("different-stored-token");
      deleteRefreshToken.mockResolvedValue(undefined as any);

      await expect(service.refresh("refresh-token")).rejects.toThrow(
        "Invalid refresh token"
      );
      expect(deleteRefreshToken).toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("should delete refresh token from Redis", async () => {
      deleteRefreshToken.mockResolvedValue(undefined as any);

      await service.logout(1, "s1");

      expect(deleteRefreshToken).toHaveBeenCalledWith(1, "s1");
    });
  });

  describe("verifyEmail", () => {
    it("should verify user and clear token", async () => {
      const fakeUser = {
        isVerified: false,
        verificationToken: "hashed",
        save: jest.fn(),
      };
      hashToken.mockReturnValue("hashed-token");
      mockFindByVerificationToken.mockResolvedValue(fakeUser);

      const result = await service.verifyEmail("raw-token");

      expect(fakeUser.isVerified).toBe(true);
      expect(fakeUser.verificationToken).toBeNull();
      expect(fakeUser.save).toHaveBeenCalled();
      expect(result.message).toBe("Email verified successfully");
    });

    it("should throw for invalid token", async () => {
      mockFindByVerificationToken.mockResolvedValue(null);

      await expect(service.verifyEmail("bad-token")).rejects.toThrow("Invalid verification token");
    });
  });

  describe("forgotPassword", () => {
    it("should send reset email for existing user", async () => {
      const fakeUser = {
        email: "t@t.com",
        resetPasswordToken: null,
        resetPasswordExpires: null,
        save: jest.fn(),
      };
      mockFindByEmail.mockResolvedValue(fakeUser);

      const result = await service.forgotPassword("t@t.com");

      expect(fakeUser.save).toHaveBeenCalled();
      expect(addEmailJob).toHaveBeenCalled();
      expect(result!.message).toBe("Password reset email sent");
    });

    it("should silently return for non-existent user (no user enumeration)", async () => {
      mockFindByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword("nobody@test.com");
      expect(result).toBeUndefined();
      expect(addEmailJob).not.toHaveBeenCalled();
    });
  });

  describe("resetPassword", () => {
    it("should reset password and clear reset token", async () => {
      const fakeUser = {
        password: "old-hash",
        resetPasswordToken: "h",
        resetPasswordExpires: new Date(),
        save: jest.fn(),
      };
      mockFindValidResetToken.mockResolvedValue(fakeUser);
      hashPassword.mockResolvedValue("new-hashed-pw");

      const result = await service.resetPassword("raw-token", "newPass123");

      expect(fakeUser.password).toBe("new-hashed-pw");
      expect(fakeUser.resetPasswordToken).toBeNull();
      expect(fakeUser.resetPasswordExpires).toBeNull();
      expect(fakeUser.save).toHaveBeenCalled();
      expect(result.message).toBe("Password reset successful");
    });

    it("should throw for invalid or expired reset token", async () => {
      mockFindValidResetToken.mockResolvedValue(null);

      await expect(
        service.resetPassword("bad-token", "newPass")
      ).rejects.toThrow("Invalid or expired reset token");
    });
  });
});

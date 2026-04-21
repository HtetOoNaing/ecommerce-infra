jest.mock("otplib", () => ({
  authenticator: {
    generateSecret: jest.fn(),
    keyuri: jest.fn(),
    check: jest.fn(),
  },
}));

jest.mock("qrcode", () => ({
  toDataURL: jest.fn(),
}));

jest.mock("@/modules/user/user.service", () => ({
  UserService: jest.fn().mockImplementation(() => ({
    findByIdRaw: jest.fn(),
    updateTotpSecret: jest.fn(),
    enableMfa: jest.fn(),
    disableMfa: jest.fn(),
  })),
}));

import { TotpService } from "@/modules/totp/totp.service";
import { UserService } from "@/modules/user/user.service";
import { authenticator } from "otplib";
import QRCode from "qrcode";

const mockGenerateSecret = authenticator.generateSecret as jest.Mock;
const mockKeyuri = authenticator.keyuri as jest.Mock;
const mockCheck = authenticator.check as jest.Mock;
const mockToDataURL = QRCode.toDataURL as jest.Mock;

describe("TotpService", () => {
  let service: TotpService;
  let userSvc: jest.Mocked<InstanceType<typeof UserService>>;

  beforeAll(() => {
    // UserService is instantiated at totp.service.ts module level (once, at import).
    // mock.results[0].value is the object returned by mockImplementation.
    // We capture it in beforeAll (runs once) before beforeEach clears mock.results.
    userSvc = jest.mocked(UserService).mock.results[0]!.value as jest.Mocked<InstanceType<typeof UserService>>;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TotpService();
  });

  describe("generateSetup", () => {
    it("generates secret, QR code, and saves the secret", async () => {
      userSvc.findByIdRaw.mockResolvedValue({
        id: 1,
        email: "admin@test.com",
        isMfaEnabled: false,
      } as never);
      mockGenerateSecret.mockReturnValue("BASE32SECRET");
      mockKeyuri.mockReturnValue("otpauth://totp/...");
      mockToDataURL.mockResolvedValue("data:image/png;base64,...");

      const result = await service.generateSetup(1);

      expect(userSvc.findByIdRaw).toHaveBeenCalledWith(1);
      expect(mockGenerateSecret).toHaveBeenCalled();
      expect(userSvc.updateTotpSecret).toHaveBeenCalledWith(1, "BASE32SECRET");
      expect(result).toEqual({
        secret: "BASE32SECRET",
        otpauthUrl: "otpauth://totp/...",
        qrCodeDataUrl: "data:image/png;base64,...",
      });
    });

    it("throws conflict when MFA is already enabled", async () => {
      userSvc.findByIdRaw.mockResolvedValue({
        id: 1,
        email: "admin@test.com",
        isMfaEnabled: true,
      } as never);

      await expect(service.generateSetup(1)).rejects.toMatchObject({
        status: 409,
      });
    });

    it("throws not found when user does not exist", async () => {
      userSvc.findByIdRaw.mockResolvedValue(null);

      await expect(service.generateSetup(1)).rejects.toMatchObject({
        status: 404,
      });
    });
  });

  describe("enableMfa", () => {
    it("enables MFA when token is valid", async () => {
      userSvc.findByIdRaw.mockResolvedValue({
        id: 1,
        isMfaEnabled: false,
        totpSecret: "SECRET",
      } as never);
      mockCheck.mockReturnValue(true);

      await service.enableMfa(1, "123456");

      expect(mockCheck).toHaveBeenCalledWith("123456", "SECRET");
      expect(userSvc.enableMfa).toHaveBeenCalledWith(1);
    });

    it("throws bad request when token is invalid", async () => {
      userSvc.findByIdRaw.mockResolvedValue({
        id: 1,
        isMfaEnabled: false,
        totpSecret: "SECRET",
      } as never);
      mockCheck.mockReturnValue(false);

      await expect(service.enableMfa(1, "000000")).rejects.toMatchObject({
        status: 400,
      });
    });

    it("throws bad request when setup has not been started", async () => {
      userSvc.findByIdRaw.mockResolvedValue({
        id: 1,
        isMfaEnabled: false,
        totpSecret: null,
      } as never);

      await expect(service.enableMfa(1, "123456")).rejects.toMatchObject({
        status: 400,
      });
    });
  });

  describe("disableMfa", () => {
    it("disables MFA when token is valid", async () => {
      userSvc.findByIdRaw.mockResolvedValue({
        id: 1,
        isMfaEnabled: true,
        totpSecret: "SECRET",
      } as never);
      mockCheck.mockReturnValue(true);

      await service.disableMfa(1, "123456");

      expect(userSvc.disableMfa).toHaveBeenCalledWith(1);
    });

    it("throws bad request when token is invalid", async () => {
      userSvc.findByIdRaw.mockResolvedValue({
        id: 1,
        isMfaEnabled: true,
        totpSecret: "SECRET",
      } as never);
      mockCheck.mockReturnValue(false);

      await expect(service.disableMfa(1, "000000")).rejects.toMatchObject({
        status: 400,
      });
    });

    it("throws bad request when MFA is not enabled", async () => {
      userSvc.findByIdRaw.mockResolvedValue({
        id: 1,
        isMfaEnabled: false,
        totpSecret: null,
      } as never);

      await expect(service.disableMfa(1, "123456")).rejects.toMatchObject({
        status: 400,
      });
    });
  });

  describe("verifyToken", () => {
    it("returns true for a valid token", () => {
      mockCheck.mockReturnValue(true);
      expect(service.verifyToken("SECRET", "123456")).toBe(true);
    });

    it("returns false for an invalid token", () => {
      mockCheck.mockReturnValue(false);
      expect(service.verifyToken("SECRET", "000000")).toBe(false);
    });
  });
});

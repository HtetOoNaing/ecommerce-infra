import { authenticator } from "otplib";
import QRCode from "qrcode";
import { AppError } from "@/utils/appError";
import { UserService } from "@/modules/user/user.service";
import { TotpSetupResponse } from "./totp.types";

const APP_NAME = "InfraPro Admin";
const userService = new UserService();

export class TotpService {
  async generateSetup(userId: number): Promise<TotpSetupResponse> {
    const user = await userService.findByIdRaw(userId);
    if (!user) throw AppError.notFound("User not found");

    if (user.isMfaEnabled) {
      throw AppError.conflict("MFA is already enabled for this account");
    }

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, APP_NAME, secret);
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    await userService.updateTotpSecret(userId, secret);

    return { secret, otpauthUrl, qrCodeDataUrl };
  }

  async enableMfa(userId: number, token: string): Promise<void> {
    const user = await userService.findByIdRaw(userId);
    if (!user) throw AppError.notFound("User not found");

    if (user.isMfaEnabled) {
      throw AppError.conflict("MFA is already enabled");
    }

    if (!user.totpSecret) {
      throw AppError.badRequest("MFA setup not started — call /totp/setup first");
    }

    const valid = authenticator.check(token, user.totpSecret);
    if (!valid) throw AppError.badRequest("Invalid or expired TOTP token");

    await userService.enableMfa(userId);
  }

  async disableMfa(userId: number, token: string): Promise<void> {
    const user = await userService.findByIdRaw(userId);
    if (!user) throw AppError.notFound("User not found");

    if (!user.isMfaEnabled) {
      throw AppError.badRequest("MFA is not enabled for this account");
    }

    const valid = authenticator.check(token, user.totpSecret!);
    if (!valid) throw AppError.badRequest("Invalid or expired TOTP token");

    await userService.disableMfa(userId);
  }

  verifyToken(secret: string, token: string): boolean {
    return authenticator.check(token, secret);
  }
}

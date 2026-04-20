import { UserService } from "@/modules/user/user.service";
import { RegisterDTO, LoginDTO } from "./auth.types";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/utils/jwt";
import { deleteRefreshToken, getRefreshToken, setRefreshToken } from "./auth.redis";
import { v4 as uuidv4 } from "uuid";
import { generateToken, hashToken } from "@/utils/token";
import { hashPassword, comparePassword } from "@/utils/hash";
import { addEmailJob } from "@/jobs/producers/email.producer";
import { logger } from "@/config/logger";
import { AppError } from "@/utils/appError";

const userService = new UserService();

export class AuthService {
  async register(data: RegisterDTO, requestId?: string) {
    logger.info('Registering user', { requestId, email: data.email });
    const existing = await userService.findByEmail(data.email);
    if (existing) {
      throw AppError.conflict("User already exists");
    }

    const sessionId = uuidv4();
    const verificationToken = generateToken();
    const hashedToken = hashToken(verificationToken);

    const hashedPassword = await hashPassword(data.password);

    const user = await userService.createUser({
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: data.role || "user",
      verificationToken: hashedToken,
      isVerified: false,
    });

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      sessionId
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await setRefreshToken(user.id, sessionId, refreshToken);

    const verifyUrl = `${process.env.API_URL}/auth/verify-email?token=${verificationToken}`;

    await addEmailJob({
      to: user.email,
      subject: "Verify your account",
      html: `Click here: ${verifyUrl}`,
    });

    logger.info('User registered successfully', { requestId, userId: user.id, email: user.email });
    return { user, accessToken, refreshToken };
  }

  async login(data: LoginDTO, requestId?: string) {
    logger.info('User login attempt', { requestId, email: data.email });
    const user = await userService.findByEmail(data.email);

    if (!user) throw AppError.unauthorized("Invalid credentials");

    if (!user.isVerified) {
      throw AppError.forbidden("Please verify your email first");
    }

    const sessionId = uuidv4();

    const isValid = await comparePassword(data.password, user.password);

    if (!isValid) throw AppError.unauthorized("Invalid credentials");

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      sessionId
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    
    await setRefreshToken(user.id, sessionId, refreshToken);

    logger.info('User logged in successfully', { requestId, userId: user.id, email: user.email });
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);

    const stored = await getRefreshToken(payload.id, payload.sessionId);

    // Token mismatch → possible attack
    if (!stored || stored !== refreshToken) {
      await deleteRefreshToken(payload.id, payload.sessionId);
      throw AppError.unauthorized("Invalid refresh token");
    }

    // ROTATION START
    await deleteRefreshToken(payload.id, payload.sessionId);
  
    const newPayload = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId
    };

    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    await setRefreshToken(payload.id, payload.sessionId, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: number, sessionId: string) {
    await deleteRefreshToken(userId, sessionId);
  }

  async verifyEmail(token: string) {
    const hashed = hashToken(token);

    const user = await userService.findByVerificationToken(hashed);

    if (!user) throw AppError.badRequest("Invalid verification token");

    user.isVerified = true;
    user.verificationToken = null;

    await user.save();

    return { message: "Email verified successfully" };
  }

  async forgotPassword(email: string) {
    const user = await userService.findByEmail(email);
    if (!user) return;

    const resetToken = generateToken();
    const hashed = hashToken(resetToken);

    user.resetPasswordToken = hashed;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await user.save();

    const resetUrl = `${process.env.FE_URL}/reset-password?token=${resetToken}`;

    await addEmailJob({
      to: user.email,
      subject: "Reset Password",
      html: `Reset here: ${resetUrl}`,
    });
    
    return { message: "Password reset email sent" };
  }

  async resetPassword(token: string, newPassword: string) {
    const hashed = hashToken(token);

    const user = await userService.findValidResetToken(
      hashed,
      new Date()
    );

    if (!user) throw AppError.badRequest("Invalid or expired reset token");

    user.password = await hashPassword(newPassword);

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return { message: "Password reset successful" };
  }
}
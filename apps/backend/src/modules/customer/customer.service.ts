import { AppError } from "@/utils/appError";
import { hashPassword, comparePassword } from "@/utils/hash";
import { generateToken, hashToken } from "@/utils/token";
import { days } from "@/utils/time";
import {
  signCustomerAccessToken,
  signCustomerRefreshToken,
  verifyCustomerRefreshToken,
} from "@/utils/customer-jwt";
import { addEmailJob } from "@/jobs/producers/email.producer";
import { CustomerRepository } from "./customer.repository";
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerResponseDto,
  CustomerAuthResponse,
  AddAddressDto,
} from "./customer.types";
import { v4 as uuidv4 } from "uuid";

export class CustomerService {
  private repo = new CustomerRepository();

  private toResponse(customer: any): CustomerResponseDto {
    return {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      emailVerified: customer.emailVerified,
      shippingAddresses: customer.shippingAddresses || [],
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }

  async register(data: CreateCustomerDto): Promise<CustomerAuthResponse> {
    const existing = await this.repo.findByEmail(data.email);
    if (existing) {
      throw AppError.conflict(`Customer with email "${data.email}" already exists`);
    }

    const hashedPassword = await hashPassword(data.password);
    const verificationToken = generateToken();

    const customer = await this.repo.create({
      ...data,
      password: hashedPassword,
    });

    await this.repo.setVerificationToken(customer.id, hashToken(verificationToken));

    // Send verification email
    await addEmailJob({
      to: customer.email,
      subject: "Verify your email",
      html: `Click to verify: ${process.env.FE_URL}/verify-email?token=${verificationToken}`,
    });

    const sessionId = uuidv4();
    const accessToken = signCustomerAccessToken({
      id: customer.id,
      email: customer.email,
      sessionId,
    });
    const refreshToken = signCustomerRefreshToken({
      id: customer.id,
      email: customer.email,
      sessionId,
    });

    return {
      customer: this.toResponse(customer),
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string): Promise<CustomerAuthResponse> {
    const customer = await this.repo.findByEmail(email);
    if (!customer) {
      throw AppError.unauthorized("Invalid credentials");
    }

    if (!customer.emailVerified) {
      throw AppError.unauthorized("Email not verified. Please check your inbox.");
    }

    const isValid = await comparePassword(password, customer.password);
    if (!isValid) {
      throw AppError.unauthorized("Invalid credentials");
    }

    const sessionId = uuidv4();
    const accessToken = signCustomerAccessToken({
      id: customer.id,
      email: customer.email,
      sessionId,
    });
    const refreshToken = signCustomerRefreshToken({
      id: customer.id,
      email: customer.email,
      sessionId,
    });

    return {
      customer: this.toResponse(customer),
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = verifyCustomerRefreshToken(refreshToken);
    const customer = await this.repo.findById(payload.id);

    if (!customer) {
      throw AppError.unauthorized("Invalid refresh token");
    }

    const sessionId = uuidv4();
    const newAccessToken = signCustomerAccessToken({
      id: customer.id,
      email: customer.email,
      sessionId,
    });
    const newRefreshToken = signCustomerRefreshToken({
      id: customer.id,
      email: customer.email,
      sessionId,
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async forgotPassword(email: string): Promise<void> {
    const customer = await this.repo.findByEmail(email);
    if (!customer) {
      // Don't reveal if email exists
      return;
    }

    const resetToken = generateToken();
    const expires = new Date(Date.now() + days(1)); // 24 hours

    await this.repo.setResetToken(customer.id, hashToken(resetToken), expires);

    await addEmailJob({
      to: customer.email,
      subject: "Reset your password",
      html: `Click to reset: ${process.env.FE_URL}/reset-password?token=${resetToken}`,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = hashToken(token);
    const customer = await this.repo.findByResetToken(hashedToken);

    if (!customer || !customer.resetPasswordExpires) {
      throw AppError.badRequest("Invalid or expired reset token");
    }

    if (customer.resetPasswordExpires < new Date()) {
      throw AppError.badRequest("Reset token has expired");
    }

    const hashedPassword = await hashPassword(newPassword);
    await this.repo.updatePassword(customer.id, hashedPassword);
  }

  async verifyEmail(token: string): Promise<void> {
    const hashedToken = hashToken(token);
    const customer = await this.repo.findByVerificationToken(hashedToken);

    if (!customer) {
      throw AppError.badRequest("Invalid verification token");
    }

    await this.repo.verifyEmail(customer.id);
  }

  async getProfile(customerId: number): Promise<CustomerResponseDto> {
    const customer = await this.repo.findById(customerId);
    if (!customer) {
      throw AppError.notFound("Customer not found");
    }
    return this.toResponse(customer);
  }

  async updateProfile(customerId: number, data: UpdateCustomerDto): Promise<CustomerResponseDto> {
    const updated = await this.repo.update(customerId, data);
    if (!updated) {
      throw AppError.notFound("Customer not found");
    }
    return this.toResponse(updated);
  }

  async getAddresses(customerId: number) {
    const customer = await this.repo.findById(customerId);
    if (!customer) {
      throw AppError.notFound("Customer not found");
    }
    return customer.shippingAddresses || [];
  }

  async addAddress(customerId: number, address: AddAddressDto) {
    const customer = await this.repo.findById(customerId);
    if (!customer) {
      throw AppError.notFound("Customer not found");
    }

    const addresses = customer.shippingAddresses || [];
    const newAddress = {
      id: uuidv4(),
      ...address,
      isDefault: address.isDefault || false,
    };

    // If this is the first address or isDefault is true, set as default
    if (addresses.length === 0 || newAddress.isDefault) {
      addresses.forEach((a: any) => (a.isDefault = false));
    }

    addresses.push(newAddress);
    const updated = await this.repo.updateShippingAddresses(customerId, addresses);

    if (!updated) {
      throw AppError.internal("Failed to add address");
    }

    return newAddress;
  }

  async deleteAddress(customerId: number, addressId: string) {
    const customer = await this.repo.findById(customerId);
    if (!customer) {
      throw AppError.notFound("Customer not found");
    }

    const addresses = (customer.shippingAddresses || []).filter(
      (a: any) => a.id !== addressId
    );

    const updated = await this.repo.updateShippingAddresses(customerId, addresses);
    if (!updated) {
      throw AppError.internal("Failed to delete address");
    }
  }
}

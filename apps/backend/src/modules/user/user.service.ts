import { User } from "./user.model";
import { UserRepository } from "./user.repository";
import {
  CreateUserDto,
  UserResponseDto,
  UserEntity,
  PaginationQuery,
  PaginatedResponse,
} from "./user.types";
import { AppError } from "@/utils/appError";

export class UserService {
  private repo = new UserRepository();

  private toResponse(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      role: user.role,
      isVerified: user.isVerified,
    };
  }

  async createUser(data: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.repo.findByEmail(data.email);

    if (existing) {
      throw AppError.conflict("User already exists");
    }

    const user = await this.repo.create(data);

    return this.toResponse(user);
  }

  async getUsers(query: PaginationQuery): Promise<PaginatedResponse<UserResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const result = await this.repo.findAll(page, limit);

    return {
      data: result.data.map((u) => this.toResponse(u)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findByEmail(email);
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.repo.findByVerificationToken(token);
  }

  async findById(id: number): Promise<UserEntity | null> {
    return this.repo.findById(id);
  }

  async findValidResetToken(token: string, now: Date): Promise<User | null> {
    return this.repo.findValidResetToken(token, now);
  }

  findByIdRaw(id: number): Promise<User | null> {
    return this.repo.findByIdRaw(id);
  }

  async updateTotpSecret(userId: number, secret: string | null): Promise<void> {
    return this.repo.updateTotpSecret(userId, secret);
  }

  async enableMfa(userId: number): Promise<void> {
    return this.repo.enableMfa(userId);
  }

  async disableMfa(userId: number): Promise<void> {
    return this.repo.disableMfa(userId);
  }
}
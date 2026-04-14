import { User } from "./user.model";
import { UserRepository } from "./user.repository";
import {
  CreateUserDto,
  UserResponseDto,
  UserEntity,
} from "./user.types";

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
      throw new Error("User already exists");
    }

    const user = await this.repo.create(data);

    return this.toResponse(user);
  }

  async getUsers(): Promise<UserResponseDto[]> {
    const users = await this.repo.findAll();
    return users.map((u) => this.toResponse(u));
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
}
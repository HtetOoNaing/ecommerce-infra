export type UserRole = "user" | "admin";

export interface UserEntity {
  id: number;
  email: string;
  password: string;
  name?: string | null;
  role: UserRole;
  isVerified: boolean;
  verificationToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}


export interface UserResponseDto {
  id: number;
  email: string;
  name?: string | null;
  role: UserRole;
  isVerified: boolean;
}

export interface CreateUserDto {
  email: string;
  name?: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  verificationToken?: string | null;
}
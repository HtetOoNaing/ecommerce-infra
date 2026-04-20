export type UserRole = "user" | "admin";

export interface AuthUser {
  id: number;
  email: string;
  name?: string | null;
  role: UserRole;
  isVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

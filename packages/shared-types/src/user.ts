import type { UserRole } from "./auth";

export interface User {
  id: number;
  email: string;
  name?: string | null;
  role: UserRole;
  isVerified: boolean;
}

export interface RegisterDTO {
  email: string;
  password: string;
  name?: string;
  role?: "user" | "admin";
}

export interface LoginDTO {
  email: string;
  password: string;
  totpToken?: string;
}
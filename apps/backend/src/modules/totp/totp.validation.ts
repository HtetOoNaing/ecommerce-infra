import { z } from "zod";

export const totpVerifySchema = z.object({
  token: z
    .string()
    .length(6, "TOTP token must be exactly 6 digits")
    .regex(/^\d{6}$/, "TOTP token must contain only digits"),
});

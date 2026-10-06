import { z } from "zod";

export const mobileRefreshSchema = z.object({
  refreshToken: z.string().trim().min(1, "El refresh token es obligatorio."),
});

export type MobileRefreshInput = z.infer<typeof mobileRefreshSchema>;

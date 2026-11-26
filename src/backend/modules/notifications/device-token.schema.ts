import { z } from "zod";

export const deviceTokenSchema = z.object({
  token: z.string().trim().min(1).max(500),
  platform: z.enum(["android", "ios", "web"]),
});

export type DeviceTokenInput = z.infer<typeof deviceTokenSchema>;

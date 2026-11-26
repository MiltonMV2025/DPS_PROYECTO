import { z } from "zod";
import { patientProfileSchema } from "./auth.schema";

export const mobileRefreshSchema = z.object({
  refreshToken: z.string().trim().min(1, "El refresh token es obligatorio."),
});

export const mobileFirebaseLoginSchema = z.object({
  idToken: z.string().trim().min(1, "El token de Firebase es obligatorio."),
});

export const mobileGoogleRegisterSchema = patientProfileSchema
  .omit({ correo: true })
  .extend({
    idToken: z.string().trim().min(1, "El token de Firebase es obligatorio."),
  });

export type MobileRefreshInput = z.infer<typeof mobileRefreshSchema>;
export type MobileFirebaseLoginInput = z.infer<
  typeof mobileFirebaseLoginSchema
>;
export type MobileGoogleRegisterInput = z.infer<typeof mobileGoogleRegisterSchema>;

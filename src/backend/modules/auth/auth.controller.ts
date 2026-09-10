import { ApplicationError } from "@/backend/errors";
import { createAuthService, type AuthService } from "./auth.service";
import { loginSchema, registerSchema } from "./auth.schema";
import type { SessionUser } from "./auth.types";

function parse<T>(schema: { safeParse: (value: unknown) => { success: boolean; data?: T; error?: { issues: { message: string }[] } } }, raw: unknown): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    const message = result.error?.issues[0]?.message ?? "Datos inválidos.";
    throw new ApplicationError("VALIDATION", message, 400);
  }
  return result.data as T;
}

export function createAuthController(service: AuthService = createAuthService()) {
  return {
    register(raw: unknown): Promise<SessionUser> {
      return service.register(parse(registerSchema, raw));
    },
    login(raw: unknown): Promise<SessionUser> {
      return service.login(parse(loginSchema, raw));
    },
  };
}

export type AuthController = ReturnType<typeof createAuthController>;

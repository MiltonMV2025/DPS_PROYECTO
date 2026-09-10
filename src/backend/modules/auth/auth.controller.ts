import { parseInput } from "@/backend/utils";
import { createAuthService, type AuthService } from "./auth.service";
import { loginSchema, registerSchema } from "./auth.schema";
import type { SessionUser } from "./auth.types";

export function createAuthController(service: AuthService = createAuthService()) {
  return {
    register(raw: unknown): Promise<SessionUser> {
      return service.register(parseInput(registerSchema, raw));
    },
    login(raw: unknown): Promise<SessionUser> {
      return service.login(parseInput(loginSchema, raw));
    },
  };
}

export type AuthController = ReturnType<typeof createAuthController>;

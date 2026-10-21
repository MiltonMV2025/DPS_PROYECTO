import { parseInput } from "@/backend/utils";
import { loginSchema } from "./auth.schema";
import { mobileRefreshSchema } from "./mobile-auth.schema";
import { createMobileAuthService, type MobileAuthService } from "./mobile-auth.service";
import type { MobileAuthContext } from "./mobile-auth.types";

export function createMobileAuthController(service: MobileAuthService = createMobileAuthService()) {
  return {
    login(raw: unknown) {
      return service.login(parseInput(loginSchema, raw));
    },
    refresh(raw: unknown) {
      return service.refresh(parseInput(mobileRefreshSchema, raw).refreshToken);
    },
    logout(context: MobileAuthContext) {
      return service.logout(context.familyToken);
    },
    me(context: MobileAuthContext) {
      return Promise.resolve(context.user);
    },
  };
}

export type MobileAuthController = ReturnType<typeof createMobileAuthController>;

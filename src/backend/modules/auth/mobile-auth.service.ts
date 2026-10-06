import { createHash, randomBytes, randomUUID } from "node:crypto";
import { SignJWT } from "jose";
import { ApplicationError } from "@/backend/errors";
import { getMobileAuthSecret } from "@/backend/config";
import { createAuthService, type AuthService } from "./auth.service";
import { createMobileSessionRepository, type MobileSessionRepository } from "./mobile-session.repository";
import type { LoginInput } from "./auth.schema";
import {
  MOBILE_ACCESS_TOKEN_AUDIENCE,
  MOBILE_ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  MOBILE_ACCESS_TOKEN_TYPE,
  MOBILE_REFRESH_TOKEN_EXPIRES_IN_DAYS,
  type MobileTokenResponse,
} from "./mobile-auth.types";
import type { SessionUser } from "./auth.types";

const key = () => new TextEncoder().encode(getMobileAuthSecret());

function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function createRefreshToken(): string {
  return randomBytes(48).toString("base64url");
}

function refreshExpiration(): Date {
  const value = new Date();
  value.setDate(value.getDate() + MOBILE_REFRESH_TOKEN_EXPIRES_IN_DAYS);
  return value;
}

async function createAccessToken(user: SessionUser, familyToken: string): Promise<string> {
  return new SignJWT({
    nombre: user.nombre,
    correo: user.correo,
    rol: user.rol,
    sid: familyToken,
    typ: MOBILE_ACCESS_TOKEN_TYPE,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setAudience(MOBILE_ACCESS_TOKEN_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${MOBILE_ACCESS_TOKEN_EXPIRES_IN_SECONDS}s`)
    .sign(key());
}

function tokenResponse(user: SessionUser, accessToken: string, refreshToken: string): MobileTokenResponse {
  return {
    tokenType: "Bearer",
    accessToken,
    refreshToken,
    expiresIn: MOBILE_ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    user,
  };
}

export function createMobileAuthService(
  authService: AuthService = createAuthService(),
  sessions: MobileSessionRepository = createMobileSessionRepository(),
) {
  return {
    async login(input: LoginInput): Promise<MobileTokenResponse> {
      const user = await authService.login(input);
      if (user.rol !== "paciente") {
        throw new ApplicationError("MOBILE_ROLE_NOT_ALLOWED", "La aplicación Mobile está disponible para cuentas de paciente.", 403);
      }
      const familyToken = randomUUID();
      const refreshToken = createRefreshToken();
      await sessions.create({
        userId: user.id,
        familyToken,
        tokenHash: hashRefreshToken(refreshToken),
        expiresAt: refreshExpiration(),
      });
      return tokenResponse(user, await createAccessToken(user, familyToken), refreshToken);
    },

    async refresh(refreshToken: string): Promise<MobileTokenResponse> {
      if (!refreshToken.trim()) throw new ApplicationError("INVALID_REFRESH_TOKEN", "El refresh token no es válido.", 401);
      const tokenHash = hashRefreshToken(refreshToken);
      return sessions.withTransaction(async (connection) => {
        const current = await sessions.findByTokenHashForUpdate(tokenHash, connection);
        if (!current) throw new ApplicationError("INVALID_REFRESH_TOKEN", "El refresh token no es válido.", 401);

        if (current.revokedAt || current.replacedBy !== null) {
          await sessions.revokeFamily(current.familyToken, "refresh_reuse_detected", connection);
          throw new ApplicationError("INVALID_REFRESH_TOKEN", "El refresh token no es válido.", 401);
        }
        if (current.expiresAt.getTime() <= Date.now()) {
          await sessions.revokeFamily(current.familyToken, "expired", connection);
          throw new ApplicationError("INVALID_REFRESH_TOKEN", "El refresh token expiró.", 401);
        }
        if (!current.user.activo) {
          await sessions.revokeFamily(current.familyToken, "account_disabled", connection);
          throw new ApplicationError("ACCOUNT_DISABLED", "La cuenta está desactivada.", 403);
        }

        const nextRefreshToken = createRefreshToken();
        const nextId = await sessions.create({
          userId: current.user.id,
          familyToken: current.familyToken,
          tokenHash: hashRefreshToken(nextRefreshToken),
          expiresAt: refreshExpiration(),
        }, connection);
        await sessions.markRotated(current.id, nextId, connection);

        const user: SessionUser = {
          id: current.user.id,
          nombre: current.user.nombre,
          correo: current.user.correo,
          rol: current.user.rol,
        };
        return tokenResponse(user, await createAccessToken(user, current.familyToken), nextRefreshToken);
      });
    },

    async logout(familyToken: string): Promise<void> {
      await sessions.revokeFamily(familyToken, "logout");
    },
  };
}

export type MobileAuthService = ReturnType<typeof createMobileAuthService>;

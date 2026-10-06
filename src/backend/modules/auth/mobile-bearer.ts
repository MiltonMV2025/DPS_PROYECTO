import { jwtVerify, type JWTPayload } from "jose";
import { ApplicationError } from "@/backend/errors";
import { getMobileAuthSecret } from "@/backend/config";
import { createMobileSessionRepository, type MobileSessionRepository } from "./mobile-session.repository";
import {
  MOBILE_ACCESS_TOKEN_AUDIENCE,
  MOBILE_ACCESS_TOKEN_TYPE,
  type MobileAuthContext,
} from "./mobile-auth.types";
import type { UserRole } from "@/backend/database/entities";

type MobileAccessClaims = JWTPayload & {
  nombre: string;
  correo: string;
  rol: UserRole;
  sid: string;
  typ: string;
};

const key = () => new TextEncoder().encode(getMobileAuthSecret());

function unauthorized(): never {
  throw new ApplicationError("UNAUTHENTICATED", "No autenticado.", 401);
}

export async function requireMobileUser(
  request: Request,
  sessions: MobileSessionRepository = createMobileSessionRepository(),
): Promise<MobileAuthContext> {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  if (!match) unauthorized();

  try {
    const { payload } = await jwtVerify<MobileAccessClaims>(match[1], key(), {
      audience: MOBILE_ACCESS_TOKEN_AUDIENCE,
    });
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || userId <= 0 || typeof payload.sid !== "string" || payload.typ !== MOBILE_ACCESS_TOKEN_TYPE) unauthorized();
    const user = await sessions.findActiveFamilyUser(payload.sid, userId);
    if (!user) unauthorized();
    return { user: { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol }, familyToken: payload.sid };
  } catch (error) {
    if (error instanceof ApplicationError) throw error;
    unauthorized();
  }
}

export function requireMobileRoles(context: MobileAuthContext, roles: UserRole[]): void {
  if (!roles.includes(context.user.rol)) {
    throw new ApplicationError("FORBIDDEN", "No tenés permisos para esta acción.", 403);
  }
}

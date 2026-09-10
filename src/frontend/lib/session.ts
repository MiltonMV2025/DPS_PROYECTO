import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
  verifySessionToken,
} from "@/backend/modules/auth";
import type { SessionUser } from "@/backend/modules/auth";
import type { UserRole } from "@/backend/database/entities";
import { ApplicationError } from "@/backend/errors";
import { canAccess, type ModuleKey } from "@/frontend/features/auth/permissions";

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireModule(moduleKey: ModuleKey): Promise<SessionUser> {
  const user = await requireUser();
  if (!canAccess(user.rol, moduleKey)) redirect("/");
  return user;
}

export async function requireApiUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new ApplicationError("UNAUTHENTICATED", "No autenticado.", 401);
  return user;
}

export function requireApiRoles(user: SessionUser, roles: UserRole[]): void {
  if (!roles.includes(user.rol)) {
    throw new ApplicationError("FORBIDDEN", "No tenés permisos para esta acción.", 403);
  }
}

export async function startSession(user: SessionUser): Promise<void> {
  const token = await createSessionToken(user);
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

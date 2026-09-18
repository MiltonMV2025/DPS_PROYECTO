import { SignJWT, jwtVerify } from "jose";
import { getAuthSecret } from "@/backend/config";
import type { SessionPayload, SessionUser } from "./auth.types";

export const SESSION_COOKIE = "sonrisa_session";

const key = () => new TextEncoder().encode(getAuthSecret());

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ nombre: user.nombre, correo: user.correo, rol: user.rol })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, key());
    return {
      id: Number(payload.sub),
      nombre: payload.nombre,
      correo: payload.correo,
      rol: payload.rol,
    };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

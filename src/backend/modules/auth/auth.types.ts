import type { UserRole } from "@/backend/database/entities";

export type SessionUser = {
  id: number;
  nombre: string;
  correo: string;
  rol: UserRole;
};

export type SessionPayload = {
  sub: string;
  nombre: string;
  correo: string;
  rol: UserRole;
};

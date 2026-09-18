import type { UserRole } from "@/backend/database/entities";

export type ModuleKey =
  | "dashboard"
  | "mi-perfil"
  | "citas"
  | "pacientes"
  | "historiales"
  | "inventario"
  | "reportes"
  | "usuarios"
  | "proveedores";

const ALL: UserRole[] = ["administrador", "odontologo", "recepcionista", "paciente"];
const STAFF: UserRole[] = ["administrador", "odontologo", "recepcionista"];

export const modulePermissions: Record<ModuleKey, UserRole[]> = {
  dashboard: STAFF,
  "mi-perfil": ["paciente"],
  citas: ALL,
  pacientes: STAFF,
  historiales: ["administrador", "odontologo"],
  inventario: STAFF,
  reportes: [],
  usuarios: ["administrador"],
  proveedores: ["administrador", "recepcionista"],
};

export function canAccess(role: UserRole, moduleKey: ModuleKey): boolean {
  return modulePermissions[moduleKey].includes(role);
}

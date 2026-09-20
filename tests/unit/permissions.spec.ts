import { expect, test } from "@playwright/test";
import { canAccess, modulePermissions, type ModuleKey } from "../../src/frontend/features/auth/permissions";
import type { UserRole } from "../../src/backend/database/entities";

const ALL_ROLES: UserRole[] = ["administrador", "odontologo", "recepcionista", "paciente"];
const STAFF_ROLES: UserRole[] = ["administrador", "odontologo", "recepcionista"];

test("no module is left with an empty role list", () => {
  // Regresion: el commit d4da1a7 dejo "reportes: []", lo que bloqueaba el
  // modulo para todos los roles (incluido administrador). Un modulo sin
  // roles asignados es casi siempre un error de configuracion, no una
  // decision intencional, asi que este test evita que vuelva a pasar
  // desapercibido para "reportes" o cualquier otro modulo futuro.
  const empty = Object.entries(modulePermissions).filter(([, roles]) => roles.length === 0);
  expect(empty).toEqual([]);
});

test("staff roles can access the reportes module", () => {
  for (const role of STAFF_ROLES) {
    expect(canAccess(role, "reportes")).toBe(true);
  }
});

test("paciente cannot access the reportes module", () => {
  expect(canAccess("paciente", "reportes")).toBe(false);
});

test("every role has a defined (true/false) answer for every module", () => {
  const moduleKeys = Object.keys(modulePermissions) as ModuleKey[];
  for (const moduleKey of moduleKeys) {
    for (const role of ALL_ROLES) {
      expect(typeof canAccess(role, moduleKey)).toBe("boolean");
    }
  }
});

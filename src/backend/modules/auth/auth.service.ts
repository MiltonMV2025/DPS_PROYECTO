import { ApplicationError } from "@/backend/errors";
import { createAuthRepository, type AuthRepository } from "./auth.repository";
import { hashPassword, verifyPassword } from "./password";
import type { RegisterInput, LoginInput } from "./auth.schema";
import type { SessionUser } from "./auth.types";

function isDuplicateEntry(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "ER_DUP_ENTRY";
}

export function createAuthService(repository: AuthRepository = createAuthRepository()) {
  return {
    async register(input: RegisterInput): Promise<SessionUser> {
      const existing = await repository.findByEmail(input.correo);
      if (existing) {
        throw new ApplicationError("EMAIL_TAKEN", "El correo ya está registrado.", 409);
      }
      const passwordHash = await hashPassword(input.password);
      try {
        const userId = await repository.createPatientAccount({
          nombre: input.nombre,
          correo: input.correo,
          passwordHash,
          telefono: input.telefono,
          fechaNacimiento: input.fechaNacimiento,
        });
        return { id: userId, nombre: input.nombre, correo: input.correo, rol: "paciente" };
      } catch (error) {
        if (isDuplicateEntry(error)) {
          throw new ApplicationError("EMAIL_TAKEN", "El correo ya está registrado.", 409);
        }
        throw error;
      }
    },

    async login(input: LoginInput): Promise<SessionUser> {
      const user = await repository.findByEmail(input.correo);
      if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
        throw new ApplicationError("INVALID_CREDENTIALS", "Correo o contraseña incorrectos.", 401);
      }
      if (!user.activo) {
        throw new ApplicationError("ACCOUNT_DISABLED", "La cuenta está desactivada.", 403);
      }
      await repository.touchLastAccess(user.id);
      return { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol };
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;

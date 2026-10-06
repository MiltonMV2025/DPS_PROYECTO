import { ApplicationError } from "@/backend/errors";
import { hashPassword } from "@/backend/modules/auth/password";
import { createUserRepository } from "./user.repository";
import type { CreateUserInput, UpdateUserInput } from "./user.schema";

export function createUserService() {
  const repository = createUserRepository();
  return {
    async create(input: CreateUserInput) {
      try { return { id: await repository.create({ ...input, passwordHash: await hashPassword(input.password) }) }; }
      catch (error) { if (isDuplicateError(error)) throw new ApplicationError("DUPLICATE_EMAIL", "Ya existe un usuario con ese correo.", 409); throw error; }
    },
    async update(input: UpdateUserInput) {
      try { await repository.update({ ...input, passwordHash: input.password ? await hashPassword(input.password) : undefined }); }
      catch (error) { if (error instanceof Error && error.message === "USER_NOT_FOUND") throw new ApplicationError("USER_NOT_FOUND", "El usuario no existe.", 404); if (isDuplicateError(error)) throw new ApplicationError("DUPLICATE_EMAIL", "Ya existe un usuario con ese correo.", 409); throw error; }
    },
    async suspend(id: number, actorId: number) {
      try { await repository.suspend(id, actorId); }
      catch (error) { if (error instanceof Error && error.message === "CANNOT_SUSPEND_SELF") throw new ApplicationError("CANNOT_SUSPEND_SELF", "No podés suspender tu propio usuario.", 409); if (error instanceof Error && error.message === "USER_NOT_FOUND") throw new ApplicationError("USER_NOT_FOUND", "El usuario no existe.", 404); if (error instanceof Error && error.message === "USER_ALREADY_SUSPENDED") throw new ApplicationError("USER_ALREADY_SUSPENDED", "El usuario ya está suspendido.", 409); throw error; }
    },
  };
}
function isDuplicateError(error: unknown): boolean { return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "ER_DUP_ENTRY"; }
export type UserService = ReturnType<typeof createUserService>;

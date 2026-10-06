import { randomBytes } from "node:crypto";
import { ApplicationError } from "@/backend/errors";
import { hashPassword } from "@/backend/modules/auth/password";
import { createPatientRepository } from "./patient.repository";
import type { CreatePatientInput, UpdatePatientInput } from "./patient.schema";

export function createPatientService() {
  const repository = createPatientRepository();
  return {
    async create(input: CreatePatientInput) {
      const temporaryPassword = randomBytes(6).toString("base64url");
      try { return { ...(await repository.create({ ...input, passwordHash: await hashPassword(temporaryPassword) })), temporaryPassword }; }
      catch (error) { if (isDuplicateError(error)) throw new ApplicationError("DUPLICATE_EMAIL", "Ya existe un usuario con ese correo.", 409); throw error; }
    },
    async update(input: UpdatePatientInput) {
      try { await repository.update(input); }
      catch (error) {
        if (error instanceof Error && error.message === "PATIENT_NOT_FOUND") throw new ApplicationError("PATIENT_NOT_FOUND", "El paciente no existe.", 404);
        if (isDuplicateError(error)) throw new ApplicationError("DUPLICATE_EMAIL", "Ya existe un usuario con ese correo.", 409);
        throw error;
      }
    },
    async remove(id: number) {
      try { await repository.remove(id); }
      catch (error) {
        if (error instanceof Error && error.message === "PATIENT_NOT_FOUND") throw new ApplicationError("PATIENT_NOT_FOUND", "El paciente no existe.", 404);
        throw error;
      }
    },
  };
}

function isDuplicateError(error: unknown): boolean { return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "ER_DUP_ENTRY"; }
export type PatientService = ReturnType<typeof createPatientService>;

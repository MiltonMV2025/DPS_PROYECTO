import { ApplicationError } from "@/backend/errors";
import { createPatientProfileRepository, type PatientProfileRepository } from "./profile.repository";
import type { UpdatePatientProfileInput } from "./profile.schema";

export function createPatientProfileService(repository: PatientProfileRepository = createPatientProfileRepository()) {
  return {
    async getByUserId(userId: number) {
      const profile = await repository.findByUserId(userId);
      if (!profile) throw new ApplicationError("PATIENT_PROFILE_NOT_FOUND", "No se encontró la ficha del paciente.", 404);
      return profile;
    },
    async updateByUserId(userId: number, input: UpdatePatientProfileInput) {
      const current = await repository.findByUserId(userId);
      if (!current) throw new ApplicationError("PATIENT_PROFILE_NOT_FOUND", "No se encontró la ficha del paciente.", 404);
      await repository.updateByUserId(userId, {
        telefono: input.telefono ?? current.phone,
        alergias: input.alergias === undefined ? current.allergies : input.alergias || null,
      });
      return repository.findByUserId(userId);
    },
  };
}
export type PatientProfileService = ReturnType<typeof createPatientProfileService>;

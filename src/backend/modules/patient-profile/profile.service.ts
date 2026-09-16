import { ApplicationError } from "@/backend/errors";
import { createPatientProfileRepository, type PatientProfileRepository } from "./profile.repository";

export function createPatientProfileService(repository: PatientProfileRepository = createPatientProfileRepository()) {
  return { async getByUserId(userId: number) { const profile = await repository.findByUserId(userId); if (!profile) throw new ApplicationError("PATIENT_PROFILE_NOT_FOUND", "No se encontró la ficha del paciente.", 404); return profile; } };
}
export type PatientProfileService = ReturnType<typeof createPatientProfileService>;

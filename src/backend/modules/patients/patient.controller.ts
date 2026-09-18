import { createPatientService } from "./patient.service";
import type { CreatePatientInput, UpdatePatientInput } from "./patient.schema";

export function createPatientController() {
  const service = createPatientService();
  return { create(input: CreatePatientInput) { return service.create(input); }, update(input: UpdatePatientInput) { return service.update(input); }, remove(id: number) { return service.remove(id); } };
}
export type PatientController = ReturnType<typeof createPatientController>;

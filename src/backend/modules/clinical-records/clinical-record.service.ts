/** Application service boundary for clinical records. */
import { createClinicalRecordWriteRepository, type ClinicalRecordWriteRepository } from "./clinical-record.repository";
import type { CompletionRecordInput } from "./clinical-record.types";

export function createClinicalRecordService(repository: ClinicalRecordWriteRepository = createClinicalRecordWriteRepository()) {
  return { createForCompletedAppointment: (input: CompletionRecordInput) => repository.createForCompletedAppointment(input) };
}
export type ClinicalRecordService = ReturnType<typeof createClinicalRecordService>;

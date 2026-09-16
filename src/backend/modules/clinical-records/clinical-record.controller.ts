/** HTTP-facing orchestration boundary for clinical records. */
import { createClinicalRecordService, type ClinicalRecordService } from "./clinical-record.service";
import type { CompletionRecordInput } from "./clinical-record.types";

export function createClinicalRecordController(service: ClinicalRecordService = createClinicalRecordService()) {
  return { createForCompletedAppointment: (input: CompletionRecordInput) => service.createForCompletedAppointment(input) };
}
export type ClinicalRecordController = ReturnType<typeof createClinicalRecordController>;

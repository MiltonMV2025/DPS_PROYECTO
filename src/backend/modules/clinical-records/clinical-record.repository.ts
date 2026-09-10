/** Persistence boundary for clinical records. */
export type { Repository as ClinicalRecordRepository } from "@/backend/database/repository";
export { createClinicalRecordRepository } from "@/backend/database/mysql-repositories";

/** Persistence boundary for patients. */
export type { Repository as PatientRepository } from "@/backend/database/repository";
export { createPatientRepository } from "@/backend/database/mysql-repositories";

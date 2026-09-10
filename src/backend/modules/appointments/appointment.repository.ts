/** Persistence boundary for appointments. */
export type { Repository as AppointmentRepository } from "@/backend/database/repository";
export { createAppointmentRepository } from "@/backend/database/mysql-repositories";

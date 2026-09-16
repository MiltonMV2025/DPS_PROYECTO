import { createPatientProfileService, type PatientProfileService } from "./profile.service";
export function createPatientProfileController(service: PatientProfileService = createPatientProfileService()) { return { get: (userId: number) => service.getByUserId(userId) }; }

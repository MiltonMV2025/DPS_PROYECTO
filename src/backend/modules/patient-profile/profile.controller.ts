import { parseInput } from "@/backend/utils";
import { createPatientProfileService, type PatientProfileService } from "./profile.service";
import { updatePatientProfileSchema } from "./profile.schema";

export function createPatientProfileController(service: PatientProfileService = createPatientProfileService()) {
  return {
    get: (userId: number) => service.getByUserId(userId),
    update: (userId: number, raw: unknown) => service.updateByUserId(userId, parseInput(updatePatientProfileSchema, raw)),
  };
}

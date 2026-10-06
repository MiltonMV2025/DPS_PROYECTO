import { parseInput } from "@/backend/utils";
import { createAppointmentService, type AppointmentService } from "./appointment.service";
import { appointmentAvailabilitySchema, createAppointmentSchema, mobileCreateAppointmentSchema, updateAppointmentSchema } from "./appointment.schema";
import type { ManagedAppointment } from "./appointment.repository";

export function createAppointmentController(service: AppointmentService = createAppointmentService()) {
  return {
    list(userId?: number): Promise<ManagedAppointment[]> {
      return service.list(userId);
    },
    listForPatient(userId: number): Promise<ManagedAppointment[]> {
      return service.listForPatient(userId);
    },
    manage(patientUserId?: number) {
      return service.manage(patientUserId);
    },
    create(raw: unknown): Promise<number> {
      return service.create(parseInput(createAppointmentSchema, raw));
    },
    createForPatient(userId: number, raw: unknown): Promise<number> {
      return service.createForPatient(userId, parseInput(mobileCreateAppointmentSchema, raw));
    },
    availability(raw: unknown) {
      return service.availability(parseInput(appointmentAvailabilitySchema, raw));
    },
    update(id: number, raw: unknown): Promise<{ notified: string | null }> {
      return service.update(id, parseInput(updateAppointmentSchema, raw));
    },
    cancelForPatient(id: number, userId: number): Promise<{ notified: string | null }> {
      return service.cancelForPatient(id, userId);
    },
    remove(id: number): Promise<void> {
      return service.remove(id);
    },
  };
}

export type AppointmentController = ReturnType<typeof createAppointmentController>;

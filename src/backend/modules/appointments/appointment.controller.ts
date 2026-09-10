import { parseInput } from "@/backend/utils";
import { createAppointmentService, type AppointmentService } from "./appointment.service";
import { createAppointmentSchema, updateAppointmentSchema } from "./appointment.schema";
import type { ManagedAppointment } from "./appointment.repository";

export function createAppointmentController(service: AppointmentService = createAppointmentService()) {
  return {
    list(): Promise<ManagedAppointment[]> {
      return service.list();
    },
    create(raw: unknown): Promise<number> {
      return service.create(parseInput(createAppointmentSchema, raw));
    },
    update(id: number, raw: unknown): Promise<{ notified: string | null }> {
      return service.update(id, parseInput(updateAppointmentSchema, raw));
    },
    remove(id: number): Promise<void> {
      return service.remove(id);
    },
  };
}

export type AppointmentController = ReturnType<typeof createAppointmentController>;

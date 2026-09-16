import { ApplicationError } from "@/backend/errors";
import type { AppointmentStatus } from "@/backend/database/entities";
import {
  createAppointmentWriteRepository,
  type AppointmentRepository,
} from "./appointment.repository";
import {
  createWaitingListWriteRepository,
  type WaitingListWriteRepository,
} from "@/backend/modules/waiting-list/waiting-list.repository";
import type { CreateAppointmentInput, UpdateAppointmentInput } from "./appointment.schema";
import { createNotificationService, type NotificationService } from "@/backend/modules/notifications";
import { createClinicalRecordController, type ClinicalRecordController } from "@/backend/modules/clinical-records/clinical-record.controller";

const allowedTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
  pendiente: ["confirmada", "cancelada"],
  confirmada: ["completada", "cancelada"],
  completada: [],
  cancelada: [],
};

function toMysqlDateTime(value: string): string {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::(\d{2}))?/);
  if (match) return `${match[1]} ${match[2]}:${match[3] ?? "00"}`;
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}

export function createAppointmentService(
  repository: AppointmentRepository = createAppointmentWriteRepository(),
  waitingList: WaitingListWriteRepository = createWaitingListWriteRepository(),
  notifications: NotificationService = createNotificationService(),
  clinicalRecords: ClinicalRecordController = createClinicalRecordController(),
) {
  return {
    list: (userId?: number) => repository.listUpcoming(userId),

    async manage(patientUserId?: number) {
      const [appointments, patients, dentists] = await Promise.all([
        repository.listUpcoming(patientUserId),
        patientUserId == null ? repository.listPatientOptions() : Promise.resolve([]),
        patientUserId == null ? repository.listDentistOptions() : Promise.resolve([]),
      ]);
      return { appointments, patients, dentists };
    },

    async create(input: CreateAppointmentInput): Promise<number> {
      if (!(await repository.patientExists(input.idPaciente))) {
        throw new ApplicationError("PATIENT_NOT_FOUND", "El paciente seleccionado no existe.", 400);
      }
      if (!(await repository.dentistExists(input.idOdontologo))) {
        throw new ApplicationError("DENTIST_NOT_FOUND", "El odontólogo seleccionado no está disponible.", 400);
      }
      const fechaHora = toMysqlDateTime(input.fechaHora);
      if (await repository.hasConflict(input.idOdontologo, fechaHora, input.duracionMin)) {
        throw new ApplicationError("SCHEDULE_CONFLICT", "El odontólogo ya tiene una cita en ese horario.", 409);
      }
      const id = await repository.create({
        idPaciente: input.idPaciente,
        idOdontologo: input.idOdontologo,
        fechaHora,
        duracionMin: input.duracionMin,
        motivo: input.motivo,
      });
      const patientUserId = await repository.patientUserId(input.idPaciente);
      await notifications.create(patientUserId, "appointment_pending", "Cita pendiente", "Tu cita fue registrada y está pendiente de confirmación.", id);
      return id;
    },

    async update(id: number, input: UpdateAppointmentInput): Promise<{ notified: string | null }> {
      const current = await repository.findStatus(id);
      if (!current) throw new ApplicationError("APPOINTMENT_NOT_FOUND", "La cita no existe.", 404);
      if (input.estado === current.estado) return { notified: null };
      if (!allowedTransitions[current.estado].includes(input.estado)) {
        throw new ApplicationError("INVALID_TRANSITION", "El cambio de estado no está permitido.", 409);
      }

      if (input.estado === "completada") {
        await clinicalRecords.createForCompletedAppointment({
          idCita: id,
          observaciones: input.observaciones!,
          receta: input.receta || null,
          recomendaciones: input.recomendaciones || null,
        });
      }
      await repository.updateStatus(id, input.estado);
      const notification = {
        confirmada: ["appointment_confirmed", "Cita confirmada", "Tu cita fue confirmada."],
        cancelada: ["appointment_cancelled", "Cita cancelada", "Tu cita fue cancelada."],
        completada: ["appointment_completed", "Cita completada", "Tu cita fue marcada como completada."],
      }[input.estado] as ["appointment_confirmed" | "appointment_cancelled" | "appointment_completed", string, string];
      await notifications.create(current.patientUserId, notification[0], notification[1], notification[2], id);

      if (input.estado === "cancelada") {
        const candidate = await waitingList.findNextCandidate(current.dateTime.slice(0, 10));
        if (candidate) {
          await waitingList.markNotified(candidate.idEspera);
          return { notified: candidate.paciente };
        }
      }

      return { notified: null };
    },

    async remove(id: number): Promise<void> {
      const current = await repository.findStatus(id);
      if (!current) throw new ApplicationError("APPOINTMENT_NOT_FOUND", "La cita no existe.", 404);
      await repository.remove(id);
    },
  };
}

export type AppointmentService = ReturnType<typeof createAppointmentService>;

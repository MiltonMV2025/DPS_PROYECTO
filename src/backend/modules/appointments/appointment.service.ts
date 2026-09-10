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
) {
  return {
    list: () => repository.listUpcoming(),

    async manage() {
      const [appointments, patients, dentists] = await Promise.all([
        repository.listUpcoming(),
        repository.listPatientOptions(),
        repository.listDentistOptions(),
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
      return repository.create({
        idPaciente: input.idPaciente,
        idOdontologo: input.idOdontologo,
        fechaHora,
        duracionMin: input.duracionMin,
        motivo: input.motivo,
      });
    },

    async update(id: number, input: UpdateAppointmentInput): Promise<{ notified: string | null }> {
      const current = await repository.findStatus(id);
      if (!current) throw new ApplicationError("APPOINTMENT_NOT_FOUND", "La cita no existe.", 404);
      if (input.estado === current.estado) return { notified: null };
      if (!allowedTransitions[current.estado].includes(input.estado)) {
        throw new ApplicationError("INVALID_TRANSITION", "El cambio de estado no está permitido.", 409);
      }

      await repository.updateStatus(id, input.estado);

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

import { z } from "zod";

const DURATIONS = [30, 45, 60] as const;

const futureDateTime = z.string().refine((value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() > Date.now();
}, "La fecha y hora deben ser futuras");

export const createAppointmentSchema = z.object({
  idPaciente: z.coerce.number().int().positive("Seleccioná un paciente"),
  idOdontologo: z.coerce.number().int().positive("Seleccioná un odontólogo"),
  fechaHora: futureDateTime,
  duracionMin: z.coerce.number().refine((value) => DURATIONS.includes(value as (typeof DURATIONS)[number]), "Duración inválida"),
  motivo: z
    .string()
    .trim()
    .max(150)
    .optional()
    .transform((value) => (value ? value : null)),
});

export const updateAppointmentSchema = z.object({
  estado: z.enum(["confirmada", "completada", "cancelada"]),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;

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
  diagnostico: z.string().trim().max(5000).optional(),
  tratamiento: z.string().trim().max(5000).optional(),
  observaciones: z.string().trim().max(5000).optional(),
  receta: z.string().trim().max(5000).optional(),
  recomendaciones: z.string().trim().max(5000).optional(),
}).superRefine((value, context) => {
  if (value.estado !== "completada") return;
  if (!value.diagnostico) context.addIssue({ code: z.ZodIssueCode.custom, path: ["diagnostico"], message: "El diagnóstico es obligatorio al completar la cita." });
  if (!value.tratamiento) context.addIssue({ code: z.ZodIssueCode.custom, path: ["tratamiento"], message: "El tratamiento es obligatorio al completar la cita." });
  if (!value.observaciones) context.addIssue({ code: z.ZodIssueCode.custom, path: ["observaciones"], message: "Las observaciones son obligatorias al completar la cita." });
});

export const mobileCreateAppointmentSchema = z.object({
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

export const appointmentAvailabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha no es válida").refine((value) => {
    const date = new Date(`${value}T00:00:00`);
    return !Number.isNaN(date.getTime());
  }, "La fecha no es válida"),
  idOdontologo: z.coerce.number().int().positive().optional(),
  duracionMin: z.coerce.number().refine((value) => DURATIONS.includes(value as (typeof DURATIONS)[number]), "Duración inválida").default(30),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type MobileCreateAppointmentInput = z.infer<typeof mobileCreateAppointmentSchema>;
export type AppointmentAvailabilityInput = z.infer<typeof appointmentAvailabilitySchema>;

import { z } from "zod";

export const updatePatientProfileSchema = z.object({
  telefono: z.string().trim().regex(/^[0-9+\-\s]{7,20}$/, "Teléfono inválido").optional(),
  alergias: z.string().trim().max(2000).nullable().optional(),
}).refine((value) => value.telefono !== undefined || value.alergias !== undefined, "Debés enviar al menos un campo actualizable.");

export type UpdatePatientProfileInput = z.infer<typeof updatePatientProfileSchema>;

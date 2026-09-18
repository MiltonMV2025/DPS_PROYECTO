import { z } from "zod";

const fields = {
  nombre: z.string().trim().min(1, "El nombre es obligatorio.").max(120),
  correo: z.string().trim().email("El correo no es válido.").max(150),
  telefono: z.string().trim().regex(/^\d{4}-?\d{4}$/, "Usá un teléfono de 8 dígitos, por ejemplo 7455-6612.").transform((value) => `${value.replace("-", "").slice(0, 4)}-${value.replace("-", "").slice(4)}`),
  fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha no es válida.").refine((value) => {
    const date = new Date(`${value}T00:00:00`);
    const today = new Date();
    const valid = date.getFullYear() === Number(value.slice(0, 4)) && date.getMonth() + 1 === Number(value.slice(5, 7)) && date.getDate() === Number(value.slice(8, 10));
    return valid && date <= new Date(today.getFullYear(), today.getMonth(), today.getDate()) && date >= new Date(1900, 0, 1);
  }, "La fecha debe ser válida, no futura y posterior a 1900."),
  alergias: z.string().trim().max(2000).nullable().optional(),
};

export const createSchema = z.object(fields);
export const updateSchema = createSchema.extend({ id: z.coerce.number().int().positive() });
export const deleteSchema = z.object({ id: z.coerce.number().int().positive() });

export type CreatePatientInput = z.infer<typeof createSchema>;
export type UpdatePatientInput = z.infer<typeof updateSchema>;

import { z } from "zod";

const roles = ["administrador", "odontologo", "recepcionista", "paciente"] as const;
const baseFields = {
  nombre: z.string().trim().min(1, "El nombre es obligatorio.").max(120),
  correo: z.string().trim().email("El correo no es válido.").max(150),
  rol: z.enum(roles, { errorMap: () => ({ message: "El rol no es válido." }) }),
};
export const createSchema = z.object({ ...baseFields, password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres.").max(72) });
export const updateSchema = z.object({ id: z.coerce.number().int().positive(), ...baseFields, password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres.").max(72).optional().or(z.literal("")) });
export const suspendSchema = z.object({ id: z.coerce.number().int().positive() });
export type CreateUserInput = z.infer<typeof createSchema>;
export type UpdateUserInput = z.infer<typeof updateSchema>;

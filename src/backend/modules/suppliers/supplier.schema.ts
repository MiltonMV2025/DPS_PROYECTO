import { z } from "zod";

const fields = {
  razon_social: z.string().trim().min(1, "La razón social es obligatoria.").max(150),
  categoria: z.string().trim().min(1, "La categoría es obligatoria.").max(80),
  contacto: z.string().trim().max(120).nullable().optional(),
  telefono: z.string().trim().regex(/^\d{4}-?\d{4}$/, "Usá un teléfono de 8 dígitos, por ejemplo 2245-7788.").transform((value) => { const digits = value.replace("-", ""); return `${digits.slice(0, 4)}-${digits.slice(4)}`; }).nullable().optional(),
  correo: z.string().trim().email("El correo no es válido.").max(150).nullable().optional(),
};
export const createSchema = z.object(fields);
export const updateSchema = createSchema.extend({ id: z.coerce.number().int().positive() });
export const suspendSchema = z.object({ id: z.coerce.number().int().positive() });
export type CreateSupplierInput = z.infer<typeof createSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSchema>;

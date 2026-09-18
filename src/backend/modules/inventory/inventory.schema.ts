import { z } from "zod";

const fields = {
  nombre: z.string().trim().min(1).max(120),
  categoria: z.string().trim().min(1).max(80),
  unidad_medida: z.string().trim().min(1).max(30),
  stock_actual: z.coerce.number().int().min(0),
  stock_minimo: z.coerce.number().int().min(0),
  id_proveedor: z.coerce.number().int().positive().nullable().optional(),
};

export const createSchema = z.object(fields);
export const updateSchema = createSchema.extend({ id: z.coerce.number().int().positive() });
export const deleteSchema = z.object({ id: z.coerce.number().int().positive() });

export type CreateInventoryInput = z.infer<typeof createSchema>;
export type UpdateInventoryInput = z.infer<typeof updateSchema>;

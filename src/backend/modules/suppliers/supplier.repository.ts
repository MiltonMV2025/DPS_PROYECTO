import type { Pool, ResultSetHeader } from "mysql2/promise";
import { getDatabasePool } from "@/backend/database";
import type { CreateSupplierInput, UpdateSupplierInput } from "./supplier.schema";

export type SupplierRepository = ReturnType<typeof createSupplierRepository>;
export function createSupplierRepository(db: Pool = getDatabasePool()) {
  return {
    async create(input: CreateSupplierInput): Promise<number> {
      const [result] = await db.query<ResultSetHeader>("INSERT INTO Proveedores (razon_social, categoria, contacto, telefono, correo, estado) VALUES (?, ?, ?, ?, ?, 'activo')", [input.razon_social, input.categoria, input.contacto || null, input.telefono || null, input.correo || null]);
      return result.insertId;
    },
    async update(input: UpdateSupplierInput): Promise<void> {
      const [result] = await db.query<ResultSetHeader>("UPDATE Proveedores SET razon_social=?, categoria=?, contacto=?, telefono=?, correo=? WHERE id_proveedor=?", [input.razon_social, input.categoria, input.contacto || null, input.telefono || null, input.correo || null, input.id]);
      if (result.affectedRows === 0) throw new Error("SUPPLIER_NOT_FOUND");
    },
    async suspend(id: number): Promise<void> {
      const [result] = await db.query<ResultSetHeader>("UPDATE Proveedores SET estado='inactivo' WHERE id_proveedor=? AND estado <> 'inactivo'", [id]);
      if (result.affectedRows === 0) throw new Error("SUPPLIER_ALREADY_SUSPENDED");
    },
  };
}

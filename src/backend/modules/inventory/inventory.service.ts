import type { Pool, ResultSetHeader } from "mysql2/promise";
import { getDatabasePool } from "@/backend/database";
import type { CreateInventoryInput, UpdateInventoryInput } from "./inventory.schema";

export function createInventoryService(db: Pool = getDatabasePool()) {
  return {
    async create(data: CreateInventoryInput): Promise<number> {
      const [result] = await db.query<ResultSetHeader>(
        "INSERT INTO Insumos (nombre, categoria, unidad_medida, stock_actual, stock_minimo, id_proveedor) VALUES (?, ?, ?, ?, ?, ?)",
        [data.nombre, data.categoria, data.unidad_medida, data.stock_actual, data.stock_minimo, data.id_proveedor ?? null],
      );
      return result.insertId;
    },

    async update(id: number, data: UpdateInventoryInput): Promise<void> {
      await db.query(
        "UPDATE Insumos SET nombre=?, categoria=?, unidad_medida=?, stock_actual=?, stock_minimo=?, id_proveedor=? WHERE id_insumo=?",
        [data.nombre, data.categoria, data.unidad_medida, data.stock_actual, data.stock_minimo, data.id_proveedor ?? null, id],
      );
    },

    async remove(id: number): Promise<void> {
      await db.query("DELETE FROM Insumos WHERE id_insumo=?", [id]);
    },
  };
}

export type InventoryService = ReturnType<typeof createInventoryService>;

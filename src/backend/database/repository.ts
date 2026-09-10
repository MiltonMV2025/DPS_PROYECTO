import type { Pool, RowDataPacket } from "mysql2/promise";
import { escapeId } from "mysql2";
import { getDatabasePool } from "./pool";

export type Repository<T> = { findAll(): Promise<T[]> };
type Row = RowDataPacket & Record<string, unknown>;
const allowedTables = new Set(["Usuarios", "Pacientes", "Proveedores", "Insumos", "Citas", "Lista_Espera", "Historiales_Clinicos", "Radiografias", "Detalles_Cita_Insumos", "Facturacion"]);

export function createReadRepository<T>(table: string, mapper: (row: Row) => T, pool: Pool = getDatabasePool()): Repository<T> {
  if (!allowedTables.has(table)) throw new Error("Repository table is not allowlisted");
  const safeTable = escapeId(table);
  return { async findAll() { const [rows] = await pool.query<Row[]>(`SELECT * FROM ${safeTable}`); return rows.map(mapper); } };
}

export type ReadQueryRepository<T> = { findAll(): Promise<T[]> };
export function createQueryRepository<T>(query: string, mapper: (row: Row) => T, pool: Pool = getDatabasePool()): ReadQueryRepository<T> {
  return { async findAll() { const [rows] = await pool.query<Row[]>(query); return rows.map(mapper); } };
}

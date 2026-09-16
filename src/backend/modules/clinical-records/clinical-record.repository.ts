/** Persistence boundary for clinical records. */
import type { Pool, ResultSetHeader } from "mysql2/promise";
import { getDatabasePool } from "@/backend/database/pool";
import type { CompletionRecordInput } from "./clinical-record.types";

export function createClinicalRecordWriteRepository(pool: Pool = getDatabasePool()) {
  return {
    async createForCompletedAppointment(input: CompletionRecordInput): Promise<number> {
      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO Historiales_Clinicos (id_cita, diagnostico, tratamiento, observaciones, receta, recomendaciones)
         VALUES (?, 'No registrado', 'No registrado', ?, ?, ?)`,
        [input.idCita, input.observaciones, input.receta, input.recomendaciones],
      );
      return result.insertId;
    },
  };
}

export type ClinicalRecordWriteRepository = ReturnType<typeof createClinicalRecordWriteRepository>;
export type { Repository as ClinicalRecordRepository } from "@/backend/database/repository";
export { createClinicalRecordRepository } from "@/backend/database/mysql-repositories";

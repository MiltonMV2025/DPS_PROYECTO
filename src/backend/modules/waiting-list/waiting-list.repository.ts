import type { Pool, RowDataPacket } from "mysql2/promise";
import { getDatabasePool } from "@/backend/database/pool";

export type { Repository as WaitingListRepository } from "@/backend/database/repository";
export { createWaitingListRepository } from "@/backend/database/mysql-repositories";

export type WaitingCandidate = { idEspera: number; paciente: string };

type CandidateRow = RowDataPacket & { id_espera: number; nombre: string };

export function createWaitingListWriteRepository(pool: Pool = getDatabasePool()) {
  return {
    async findNextCandidate(fechaDeseada: string): Promise<WaitingCandidate | null> {
      const [rows] = await pool.query<CandidateRow[]>(
        `SELECT le.id_espera, u.nombre
         FROM Lista_Espera le
         JOIN Pacientes p ON p.id_paciente = le.id_paciente
         JOIN Usuarios u ON u.id_usuario = p.id_usuario
         WHERE le.estado = 'en_espera' AND le.fecha_deseada = ?
         ORDER BY le.prioridad ASC, le.creado_en ASC
         LIMIT 1`,
        [fechaDeseada],
      );
      const row = rows[0];
      if (!row) return null;
      return { idEspera: Number(row.id_espera), paciente: String(row.nombre) };
    },

    async markNotified(idEspera: number): Promise<void> {
      await pool.query(
        "UPDATE Lista_Espera SET estado = 'notificado', notificado_en = NOW() WHERE id_espera = ?",
        [idEspera],
      );
    },
  };
}

export type WaitingListWriteRepository = ReturnType<typeof createWaitingListWriteRepository>;

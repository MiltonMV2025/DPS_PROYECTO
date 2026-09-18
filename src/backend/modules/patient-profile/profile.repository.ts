import type { Pool, RowDataPacket } from "mysql2/promise";
import { getDatabasePool } from "@/backend/database/pool";
import type { PatientProfile, PatientClinicalRecord } from "./profile.types";

type Row = RowDataPacket & Record<string, unknown>;

export function createPatientProfileRepository(pool: Pool = getDatabasePool()) {
  return {
    async findByUserId(userId: number): Promise<PatientProfile | null> {
      const [rows] = await pool.query<Row[]>(
        `SELECT u.nombre, u.correo, p.telefono, p.fecha_nacimiento, p.alergias
         FROM Pacientes p JOIN Usuarios u ON u.id_usuario = p.id_usuario
         WHERE p.id_usuario = ? LIMIT 1`,
        [userId],
      );
      const row = rows[0];
      if (!row) return null;
      const [recordRows] = await pool.query<Row[]>(
        `SELECT h.id_historial, h.diagnostico, h.tratamiento, h.observaciones, h.receta, h.recomendaciones, h.creado_en,
                c.fecha_hora, c.motivo, c.duracion_min, c.estado, u.nombre AS dentist_name
         FROM Historiales_Clinicos h JOIN Citas c ON c.id_cita = h.id_cita
         JOIN Pacientes p ON p.id_paciente = c.id_paciente
         JOIN Usuarios u ON u.id_usuario = c.id_odontologo
         WHERE p.id_usuario = ? ORDER BY h.creado_en DESC`,
        [userId],
      );
      const records: PatientClinicalRecord[] = recordRows.map((record) => ({ id: Number(record.id_historial), appointmentDate: record.fecha_hora instanceof Date ? record.fecha_hora.toISOString() : String(record.fecha_hora), dentist: String(record.dentist_name), reason: record.motivo == null ? null : String(record.motivo), durationMin: Number(record.duracion_min), appointmentStatus: String(record.estado), diagnosis: String(record.diagnostico), treatment: String(record.tratamiento), observations: record.observaciones == null ? null : String(record.observaciones), prescription: record.receta == null ? null : String(record.receta), recommendations: record.recomendaciones == null ? null : String(record.recomendaciones), createdAt: record.creado_en instanceof Date ? record.creado_en.toISOString() : String(record.creado_en) }));
      return { name: String(row.nombre), email: String(row.correo), phone: String(row.telefono), birthDate: String(row.fecha_nacimiento), allergies: row.alergias == null ? null : String(row.alergias), records };
    },
  };
}

export type PatientProfileRepository = ReturnType<typeof createPatientProfileRepository>;

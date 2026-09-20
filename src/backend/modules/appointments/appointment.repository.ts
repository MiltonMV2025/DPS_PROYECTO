import type { Pool, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { getDatabasePool } from "@/backend/database/pool";
import type { AppointmentStatus } from "@/backend/database/entities";

export type NewAppointment = {
  idPaciente: number;
  idOdontologo: number;
  fechaHora: string;
  duracionMin: number;
  motivo: string | null;
};

export type ManagedAppointment = {
  id: number;
  idPaciente: number;
  idOdontologo: number;
  patient: string;
  dentist: string;
  dateTime: string;
  durationMin: number;
  motivo: string | null;
  estado: AppointmentStatus;
  observaciones: string | null;
  receta: string | null;
  recomendaciones: string | null;
};

export type AppointmentStatusRecord = { estado: AppointmentStatus; dateTime: string; patientUserId: number };

export type PersonOption = { id: number; name: string };

type ManagedRow = RowDataPacket & Record<string, unknown>;
type CountRow = RowDataPacket & { total: number };

const LIST_QUERY = `
  SELECT c.id_cita, c.id_paciente, c.id_odontologo, c.fecha_hora, c.duracion_min, c.motivo, c.estado,
         h.observaciones, h.receta, h.recomendaciones,
         up.nombre AS patient_name, uo.nombre AS dentist_name
  FROM Citas c
  JOIN Pacientes p ON p.id_paciente = c.id_paciente
  JOIN Usuarios up ON up.id_usuario = p.id_usuario
  JOIN Usuarios uo ON uo.id_usuario = c.id_odontologo
  LEFT JOIN Historiales_Clinicos h ON h.id_cita = c.id_cita
  WHERE c.fecha_hora >= CURDATE()
  ORDER BY c.fecha_hora`;

const toIso = (value: unknown) => (value instanceof Date ? value.toISOString() : String(value));

export function createAppointmentWriteRepository(pool: Pool = getDatabasePool()) {
  return {
    async listUpcoming(patientUserId?: number): Promise<ManagedAppointment[]> {
      const query = patientUserId == null ? LIST_QUERY : `${LIST_QUERY.replace("WHERE c.fecha_hora >= CURDATE()", "WHERE c.fecha_hora >= CURDATE() AND p.id_usuario = ?")}`;
      const [rows] = await pool.query<ManagedRow[]>(query, patientUserId == null ? [] : [patientUserId]);
      return rows.map((row) => ({
        id: Number(row.id_cita),
        idPaciente: Number(row.id_paciente),
        idOdontologo: Number(row.id_odontologo),
        patient: String(row.patient_name),
        dentist: String(row.dentist_name),
        dateTime: toIso(row.fecha_hora),
        durationMin: Number(row.duracion_min),
        motivo: row.motivo == null ? null : String(row.motivo),
        estado: row.estado as AppointmentStatus,
        observaciones: row.observaciones == null ? null : String(row.observaciones),
        receta: row.receta == null ? null : String(row.receta),
        recomendaciones: row.recomendaciones == null ? null : String(row.recomendaciones),
      }));
    },

    async listPatientOptions(): Promise<PersonOption[]> {
      const [rows] = await pool.query<ManagedRow[]>(
        `SELECT p.id_paciente AS id, u.nombre AS name
         FROM Pacientes p JOIN Usuarios u ON u.id_usuario = p.id_usuario
         WHERE u.activo = TRUE
         ORDER BY u.nombre`,
      );
      return rows.map((row) => ({ id: Number(row.id), name: String(row.name) }));
    },

    async listDentistOptions(): Promise<PersonOption[]> {
      const [rows] = await pool.query<ManagedRow[]>(
        `SELECT id_usuario AS id, nombre AS name
         FROM Usuarios
         WHERE rol IN ('odontologo','administrador') AND activo = TRUE
         ORDER BY nombre`,
      );
      return rows.map((row) => ({ id: Number(row.id), name: String(row.name) }));
    },

    async patientExists(idPaciente: number): Promise<boolean> {
      const [rows] = await pool.query<CountRow[]>(
        "SELECT COUNT(*) AS total FROM Pacientes p JOIN Usuarios u ON u.id_usuario = p.id_usuario WHERE p.id_paciente = ? AND u.activo = TRUE",
        [idPaciente],
      );
      return Number(rows[0]?.total ?? 0) > 0;
    },

    async patientUserId(idPaciente: number): Promise<number> {
      const [rows] = await pool.query<CountRow[]>("SELECT id_usuario AS total FROM Pacientes WHERE id_paciente = ? LIMIT 1", [idPaciente]);
      return Number(rows[0]?.total);
    },

    async dentistExists(idOdontologo: number): Promise<boolean> {
      const [rows] = await pool.query<CountRow[]>(
        "SELECT COUNT(*) AS total FROM Usuarios WHERE id_usuario = ? AND rol IN ('odontologo','administrador') AND activo = TRUE",
        [idOdontologo],
      );
      return Number(rows[0]?.total ?? 0) > 0;
    },

    async hasConflict(idOdontologo: number, fechaHora: string, durationMin: number, excludeId = 0): Promise<boolean> {
      const [rows] = await pool.query<CountRow[]>(
        `SELECT COUNT(*) AS total FROM Citas
         WHERE id_odontologo = ?
           AND estado <> 'cancelada'
           AND id_cita <> ?
           AND fecha_hora < DATE_ADD(?, INTERVAL ? MINUTE)
           AND DATE_ADD(fecha_hora, INTERVAL duracion_min MINUTE) > ?`,
        [idOdontologo, excludeId, fechaHora, durationMin, fechaHora],
      );
      return Number(rows[0]?.total ?? 0) > 0;
    },

    async create(appointment: NewAppointment): Promise<number> {
      const [result] = await pool.query<ResultSetHeader>(
        "INSERT INTO Citas (id_paciente, id_odontologo, fecha_hora, duracion_min, motivo, estado) VALUES (?, ?, ?, ?, ?, 'pendiente')",
        [appointment.idPaciente, appointment.idOdontologo, appointment.fechaHora, appointment.duracionMin, appointment.motivo],
      );
      return result.insertId;
    },

    async findStatus(id: number): Promise<AppointmentStatusRecord | null> {
      const [rows] = await pool.query<ManagedRow[]>(
        "SELECT c.estado, c.fecha_hora, p.id_usuario AS patient_user_id FROM Citas c JOIN Pacientes p ON p.id_paciente = c.id_paciente WHERE c.id_cita = ? LIMIT 1",
        [id],
      );
      const row = rows[0];
      if (!row) return null;
      return { estado: row.estado as AppointmentStatus, dateTime: toIso(row.fecha_hora), patientUserId: Number(row.patient_user_id) };
    },

    async updateStatus(id: number, estado: AppointmentStatus): Promise<void> {
      await pool.query("UPDATE Citas SET estado = ? WHERE id_cita = ?", [estado, id]);
    },

    async remove(id: number): Promise<void> {
      await pool.query("DELETE FROM Citas WHERE id_cita = ?", [id]);
    },
  };
}

export type AppointmentRepository = ReturnType<typeof createAppointmentWriteRepository>;

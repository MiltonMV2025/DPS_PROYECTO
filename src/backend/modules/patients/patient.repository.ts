import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getDatabasePool } from "@/backend/database";
import type { CreatePatientInput, UpdatePatientInput } from "./patient.schema";

export type PatientRepository = ReturnType<typeof createPatientRepository>;

export function createPatientRepository(db: Pool = getDatabasePool()) {
  return {
    async create(input: CreatePatientInput & { passwordHash: string }) {
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        const [user] = await connection.query<ResultSetHeader>("INSERT INTO Usuarios (nombre, correo, rol, password_hash, activo) VALUES (?, ?, 'paciente', ?, TRUE)", [input.nombre, input.correo, input.passwordHash]);
        const [patient] = await connection.query<ResultSetHeader>("INSERT INTO Pacientes (id_usuario, telefono, fecha_nacimiento, alergias) VALUES (?, ?, ?, ?)", [user.insertId, input.telefono, input.fecha_nacimiento, input.alergias || null]);
        await connection.commit();
        return { id: patient.insertId };
      } catch (error) { await connection.rollback(); throw error; }
      finally { connection.release(); }
    },
    async update(input: UpdatePatientInput): Promise<void> {
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        const [rows] = await connection.query<(RowDataPacket & { id_usuario: number })[]>("SELECT id_usuario FROM Pacientes WHERE id_paciente=? FOR UPDATE", [input.id]);
        const patient = rows[0];
        if (!patient) throw new Error("PATIENT_NOT_FOUND");
        await connection.query("UPDATE Usuarios SET nombre=?, correo=? WHERE id_usuario=?", [input.nombre, input.correo, patient.id_usuario]);
        await connection.query("UPDATE Pacientes SET telefono=?, fecha_nacimiento=?, alergias=? WHERE id_paciente=?", [input.telefono, input.fecha_nacimiento, input.alergias || null, input.id]);
        await connection.commit();
      } catch (error) { await connection.rollback(); throw error; }
      finally { connection.release(); }
    },
    async remove(id: number): Promise<void> {
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        const [rows] = await connection.query<(RowDataPacket & { id_usuario: number })[]>("SELECT id_usuario FROM Pacientes WHERE id_paciente=?", [id]);
        const patient = rows[0];
        if (!patient) throw new Error("PATIENT_NOT_FOUND");
        await connection.query("DELETE f FROM Facturacion f INNER JOIN Citas c ON c.id_cita=f.id_cita WHERE c.id_paciente=?", [id]);
        await connection.query("DELETE n FROM Notificaciones n INNER JOIN Citas c ON c.id_cita=n.id_cita WHERE c.id_paciente=?", [id]);
        await connection.query("DELETE FROM Citas WHERE id_paciente=?", [id]);
        await connection.query("DELETE FROM Usuarios WHERE id_usuario=?", [patient.id_usuario]);
        await connection.commit();
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally { connection.release(); }
    },
  };
}

import type { Pool, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { getDatabasePool } from "@/backend/database/pool";
import type { UserRole } from "@/backend/database/entities";

type UserRow = RowDataPacket & {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol: UserRole;
  password_hash: string;
  activo: number;
};

export type AuthUserRecord = {
  id: number;
  nombre: string;
  correo: string;
  rol: UserRole;
  passwordHash: string;
  activo: boolean;
};

export type NewPatientAccount = {
  nombre: string;
  correo: string;
  passwordHash: string;
  telefono: string;
  fechaNacimiento: string;
};

export function createAuthRepository(pool: Pool = getDatabasePool()) {
  return {
    async findByEmail(correo: string): Promise<AuthUserRecord | null> {
      const [rows] = await pool.query<UserRow[]>(
        "SELECT id_usuario, nombre, correo, rol, password_hash, activo FROM Usuarios WHERE correo = ? LIMIT 1",
        [correo],
      );
      const row = rows[0];
      if (!row) return null;
      return {
        id: Number(row.id_usuario),
        nombre: row.nombre,
        correo: row.correo,
        rol: row.rol,
        passwordHash: row.password_hash,
        activo: Boolean(row.activo),
      };
    },

    async createPatientAccount(account: NewPatientAccount): Promise<number> {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const [user] = await connection.query<ResultSetHeader>(
          "INSERT INTO Usuarios (nombre, correo, rol, password_hash) VALUES (?, ?, 'paciente', ?)",
          [account.nombre, account.correo, account.passwordHash],
        );
        const userId = user.insertId;
        await connection.query(
          "INSERT INTO Pacientes (id_usuario, telefono, fecha_nacimiento) VALUES (?, ?, ?)",
          [userId, account.telefono, account.fechaNacimiento],
        );
        await connection.commit();
        return userId;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    },

    async touchLastAccess(userId: number): Promise<void> {
      await pool.query("UPDATE Usuarios SET ultimo_acceso = NOW() WHERE id_usuario = ?", [userId]);
    },
  };
}

export type AuthRepository = ReturnType<typeof createAuthRepository>;

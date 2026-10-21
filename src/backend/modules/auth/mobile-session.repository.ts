import type { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getDatabasePool } from "@/backend/database/pool";
import type { UserRole } from "@/backend/database/entities";

type SessionRow = RowDataPacket & {
  id_sesion: number;
  id_usuario: number;
  familia_token: string;
  token_hash: string;
  reemplazado_por: number | null;
  expira_en: Date | string;
  revocado_en: Date | string | null;
  nombre: string;
  correo: string;
  rol: UserRole;
  activo: number;
};

export type MobileSessionRecord = {
  id: number;
  userId: number;
  familyToken: string;
  tokenHash: string;
  replacedBy: number | null;
  expiresAt: Date;
  revokedAt: Date | null;
  user: { id: number; nombre: string; correo: string; rol: UserRole; activo: boolean };
};

export type NewMobileSession = {
  userId: number;
  familyToken: string;
  tokenHash: string;
  expiresAt: Date;
};

function asDate(value: Date | string | null): Date | null {
  return value == null ? null : value instanceof Date ? value : new Date(value);
}

function mapSession(row: SessionRow): MobileSessionRecord {
  return {
    id: Number(row.id_sesion),
    userId: Number(row.id_usuario),
    familyToken: String(row.familia_token),
    tokenHash: String(row.token_hash),
    replacedBy: row.reemplazado_por == null ? null : Number(row.reemplazado_por),
    expiresAt: asDate(row.expira_en)!,
    revokedAt: asDate(row.revocado_en),
    user: {
      id: Number(row.id_usuario),
      nombre: String(row.nombre),
      correo: String(row.correo),
      rol: row.rol,
      activo: Boolean(row.activo),
    },
  };
}

export function createMobileSessionRepository(pool: Pool = getDatabasePool()) {
  return {
    async withTransaction<T>(action: (connection: PoolConnection) => Promise<T>): Promise<T> {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const result = await action(connection);
        await connection.commit();
        return result;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    },

    async create(input: NewMobileSession, connection: Pool | PoolConnection = pool): Promise<number> {
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO Sesiones_Mobile (id_usuario, familia_token, token_hash, expira_en)
         VALUES (?, ?, ?, ?)`,
        [input.userId, input.familyToken, input.tokenHash, input.expiresAt],
      );
      return result.insertId;
    },

    async findByTokenHashForUpdate(tokenHash: string, connection: PoolConnection): Promise<MobileSessionRecord | null> {
      const [rows] = await connection.query<SessionRow[]>(
        `SELECT s.id_sesion, s.id_usuario, s.familia_token, s.token_hash, s.reemplazado_por,
                s.expira_en, s.revocado_en, u.nombre, u.correo, u.rol, u.activo
         FROM Sesiones_Mobile s
         JOIN Usuarios u ON u.id_usuario = s.id_usuario
         WHERE s.token_hash = ?
         LIMIT 1
         FOR UPDATE`,
        [tokenHash],
      );
      return rows[0] ? mapSession(rows[0]) : null;
    },

    async markRotated(id: number, replacementId: number, connection: PoolConnection): Promise<void> {
      await connection.query(
        `UPDATE Sesiones_Mobile
         SET reemplazado_por = ?, revocado_en = NOW(), motivo_revocacion = 'rotated', ultimo_uso_en = NOW()
         WHERE id_sesion = ?`,
        [replacementId, id],
      );
    },

    async revokeFamily(familyToken: string, reason: string, connection: Pool | PoolConnection = pool): Promise<void> {
      await connection.query(
        `UPDATE Sesiones_Mobile
         SET revocado_en = COALESCE(revocado_en, NOW()), motivo_revocacion = COALESCE(motivo_revocacion, ?)
         WHERE familia_token = ?`,
        [reason, familyToken],
      );
    },

    async findActiveFamilyUser(familyToken: string, userId: number): Promise<MobileSessionRecord["user"] | null> {
      const [rows] = await pool.query<SessionRow[]>(
        `SELECT s.id_usuario, s.familia_token, s.expira_en, s.revocado_en,
                u.id_usuario, u.nombre, u.correo, u.rol, u.activo,
                0 AS id_sesion, '' AS token_hash, NULL AS reemplazado_por
         FROM Sesiones_Mobile s
         JOIN Usuarios u ON u.id_usuario = s.id_usuario
         WHERE s.familia_token = ?
           AND s.id_usuario = ?
           AND s.revocado_en IS NULL
           AND s.expira_en > NOW()
           AND u.activo = TRUE
         LIMIT 1`,
        [familyToken, userId],
      );
      if (!rows[0]) return null;
      return {
        id: Number(rows[0].id_usuario),
        nombre: String(rows[0].nombre),
        correo: String(rows[0].correo),
        rol: rows[0].rol,
        activo: Boolean(rows[0].activo),
      };
    },
  };
}

export type MobileSessionRepository = ReturnType<typeof createMobileSessionRepository>;

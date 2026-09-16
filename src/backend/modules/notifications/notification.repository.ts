/** Persistence boundary for notifications. */
import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getDatabasePool } from "@/backend/database/pool";
import type { Notification, NotificationType } from "./notification.types";

type Row = RowDataPacket & Record<string, unknown>;
const iso = (value: unknown) => value instanceof Date ? value.toISOString() : String(value);

function map(row: Row): Notification {
  return { id: Number(row.id_notificacion), type: row.tipo as NotificationType, title: String(row.titulo), message: String(row.mensaje), appointmentId: row.id_cita == null ? null : Number(row.id_cita), readAt: row.leida_en == null ? null : iso(row.leida_en), createdAt: iso(row.creado_en) };
}

export function createNotificationRepository(pool: Pool = getDatabasePool()) {
  return {
    async listForUser(userId: number): Promise<Notification[]> {
      const [rows] = await pool.query<Row[]>("SELECT n.* FROM Notificaciones n WHERE n.id_usuario = ? ORDER BY n.creado_en DESC", [userId]);
      return rows.map(map);
    },
    async create(userId: number, type: NotificationType, title: string, message: string, appointmentId: number): Promise<void> {
      await pool.query("INSERT INTO Notificaciones (id_usuario, tipo, titulo, mensaje, id_cita) VALUES (?, ?, ?, ?, ?)", [userId, type, title, message, appointmentId]);
    },
    async markRead(id: number, userId: number): Promise<boolean> {
      const [result] = await pool.query<ResultSetHeader>("UPDATE Notificaciones SET leida_en = COALESCE(leida_en, NOW()) WHERE id_notificacion = ? AND id_usuario = ?", [id, userId]);
      return result.affectedRows > 0;
    },
    async markAllRead(userId: number): Promise<number> {
      const [result] = await pool.query<ResultSetHeader>("UPDATE Notificaciones SET leida_en = NOW() WHERE id_usuario = ? AND leida_en IS NULL", [userId]);
      return result.affectedRows;
    },
  };
}

export type NotificationRepository = ReturnType<typeof createNotificationRepository>;

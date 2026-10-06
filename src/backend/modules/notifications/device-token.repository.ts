import type { Pool, ResultSetHeader } from "mysql2/promise";
import { getDatabasePool } from "@/backend/database/pool";

export function createDeviceTokenRepository(pool: Pool = getDatabasePool()) {
  return {
    async upsert(userId: number, token: string, platform: "android" | "ios" | "web"): Promise<void> {
      await pool.query(
        `INSERT INTO DeviceTokens (id_usuario, token, platform, activo)
         VALUES (?, ?, ?, TRUE)
         ON DUPLICATE KEY UPDATE platform = VALUES(platform), activo = TRUE, updated_at = CURRENT_TIMESTAMP`,
        [userId, token, platform],
      );
    },
    async remove(userId: number, token: string): Promise<boolean> {
      const [result] = await pool.query<ResultSetHeader>(
        "DELETE FROM DeviceTokens WHERE id_usuario = ? AND token = ?",
        [userId, token],
      );
      return result.affectedRows > 0;
    },
  };
}

export type DeviceTokenRepository = ReturnType<typeof createDeviceTokenRepository>;

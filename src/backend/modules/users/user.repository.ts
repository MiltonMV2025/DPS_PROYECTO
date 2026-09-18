import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { getDatabasePool } from "@/backend/database";
import type { CreateUserInput, UpdateUserInput } from "./user.schema";

export type UserRepository = ReturnType<typeof createUserRepository>;
export function createUserRepository(db: Pool = getDatabasePool()) {
  return {
    async create(input: CreateUserInput & { passwordHash: string }): Promise<number> {
      const [result] = await db.query<ResultSetHeader>("INSERT INTO Usuarios (nombre, correo, rol, password_hash, activo) VALUES (?, ?, ?, ?, TRUE)", [input.nombre, input.correo, input.rol, input.passwordHash]);
      return result.insertId;
    },
    async update(input: UpdateUserInput & { passwordHash?: string }): Promise<void> {
      const [result] = input.passwordHash ? await db.query<ResultSetHeader>("UPDATE Usuarios SET nombre=?, correo=?, rol=?, password_hash=? WHERE id_usuario=?", [input.nombre, input.correo, input.rol, input.passwordHash, input.id]) : await db.query<ResultSetHeader>("UPDATE Usuarios SET nombre=?, correo=?, rol=? WHERE id_usuario=?", [input.nombre, input.correo, input.rol, input.id]);
      if (result.affectedRows === 0) throw new Error("USER_NOT_FOUND");
    },
    async suspend(id: number, actorId: number): Promise<void> {
      if (id === actorId) throw new Error("CANNOT_SUSPEND_SELF");
      const [result] = await db.query<ResultSetHeader>("UPDATE Usuarios SET activo=FALSE WHERE id_usuario=? AND activo=TRUE", [id]);
      if (result.affectedRows === 0) {
        const [rows] = await db.query<(RowDataPacket & { id_usuario: number })[]>("SELECT id_usuario FROM Usuarios WHERE id_usuario=?", [id]);
        if (!rows[0]) throw new Error("USER_NOT_FOUND");
        throw new Error("USER_ALREADY_SUSPENDED");
      }
    },
  };
}

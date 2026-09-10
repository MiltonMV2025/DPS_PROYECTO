import mysql, { type Pool } from "mysql2/promise";

import { getDatabaseConfig } from "@/backend/config";

const globalForDatabase = globalThis as typeof globalThis & {
  mysqlPool?: Pool;
};

/** Returns the shared pool, creating it only when the database is first used. */
export function getDatabasePool(): Pool {
  if (!globalForDatabase.mysqlPool) {
    const config = getDatabaseConfig();

    globalForDatabase.mysqlPool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  return globalForDatabase.mysqlPool;
}

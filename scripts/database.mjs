import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import mysql from "mysql2/promise";

const root = process.cwd();
const envPath = path.join(root, ".env");
try {
  const env = await fs.readFile(envPath, "utf8");
  for (const line of env.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]])
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
} catch {
  /* .env may be provided by the shell/CI */
}

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) throw new Error("DATABASE_URL is required");
const url = new URL(rawUrl);
if (url.protocol !== "mysql:")
  throw new Error("DATABASE_URL must use mysql://");
const database = decodeURIComponent(url.pathname.slice(1));
if (!database) throw new Error("DATABASE_URL must include a database name");
const seedOnly = process.argv.includes("--seed");
const confirmed =
  process.argv.includes("--confirm-seed") ||
  process.env.SEED_CONFIRM_DATABASE === database;
if (seedOnly && !confirmed)
  throw new Error(
    `Seed blocked. Re-run with --confirm-seed for database ${database}, or set SEED_CONFIRM_DATABASE to that exact database name.`,
  );
const config = {
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  multipleStatements: true,
};
const migrationsDir = path.join(root, "src/backend/database/migrations");
const connection = await mysql.createConnection(config);

try {
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS ${mysql.escapeId(database)} CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`,
  );
  await connection.query(`USE ${mysql.escapeId(database)}`);
  await connection.query(
    "CREATE TABLE IF NOT EXISTS _migrations (name VARCHAR(255) NOT NULL PRIMARY KEY, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  );
  const [rows] = await connection.query("SELECT name FROM _migrations");
  const applied = new Set(rows.map((row) => row.name));
  const files = (await fs.readdir(migrationsDir))
    .filter((name) => /^\d+_.*\.sql$/.test(name))
    .sort();
  for (const file of files) {
    if (file.endsWith("_seed.sql") !== seedOnly) continue;
    if (applied.has(file)) {
      console.log(`skip ${file}`);
      continue;
    }
    const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");
    try {
      await connection.query(sql);
      await connection.query("INSERT INTO _migrations (name) VALUES (?)", [
        file,
      ]);
      console.log(`applied ${file}`);
    } catch (error) {
      console.error(`Migration failed and was not recorded: ${file}`);
      throw error;
    }
  }
} finally {
  await connection.end();
}

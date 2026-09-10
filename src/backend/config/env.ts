export type DatabaseConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

const DATABASE_PROTOCOL = "mysql:";

/**
 * Parses DATABASE_URL without logging or returning the connection string in errors.
 * Reserved URL characters in credentials must be percent-encoded.
 */
export function parseDatabaseUrl(value: string): DatabaseConfig {
  if (!value.trim()) {
    throw new Error("DATABASE_URL is required");
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("DATABASE_URL must be a valid MySQL connection string");
  }

  if (parsed.protocol !== DATABASE_PROTOCOL) {
    throw new Error("DATABASE_URL must use the mysql:// protocol");
  }

  let user: string;
  let password: string;
  let database: string;
  try {
    user = decodeURIComponent(parsed.username);
    password = decodeURIComponent(parsed.password);
    database = decodeURIComponent(parsed.pathname.slice(1));
  } catch {
    throw new Error("DATABASE_URL contains invalid URL encoding");
  }

  if (!user || !password || !parsed.hostname || !database) {
    throw new Error(
      "DATABASE_URL must include user, password, host, and database",
    );
  }

  const port = parsed.port ? Number(parsed.port) : 3306;
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("DATABASE_URL contains an invalid port");
  }

  return {
    host: parsed.hostname,
    port,
    user,
    password,
    database,
  };
}

export function getDatabaseConfig(): DatabaseConfig {
  return parseDatabaseUrl(process.env.DATABASE_URL ?? "");
}

export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.trim().length < 16) {
    throw new Error("AUTH_SECRET is required and must be at least 16 characters");
  }
  return secret;
}

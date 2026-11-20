import { Pool } from "pg";

/* Resolves the PostgreSQL connection string, falling back to local dev credentials only in development. */
function getConnectionString(): string {
  const url =
    process.env.DATABASE_URL ||
    (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"
      ? "postgresql://eliopeli:devpassword@localhost:5432/eliopeli"
      : undefined);

  if (!url) {
    throw new Error("Missing required environment variable: DATABASE_URL");
  }
  return url;
}

/* Ensures the connection works with ssl in possu while working without it in local development. */
const connectionString = getConnectionString();
const useSsl = /[?&]sslmode=(require|verify-ca|verify-full)\b/i.test(connectionString);

/* Shared PostgreSQL connection pool for database queries. */
export const pool = new Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

/* Ensures the game_configs table exists before the server starts handling requests. */
export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS game_configs (
      domain VARCHAR(64) PRIMARY KEY,
      config JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

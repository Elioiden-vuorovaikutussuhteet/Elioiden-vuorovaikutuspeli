import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  (process.env.NODE_ENV === "development"
    ? "postgresql://eliopeli:devpassword@localhost:5432/eliopeli"
    : undefined);

if (!connectionString) {
  throw new Error("Missing required environment variable: DATABASE_URL");
}

export const pool = new Pool({ connectionString });

export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS game_configs (
      domain VARCHAR(64) PRIMARY KEY,
      config JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}
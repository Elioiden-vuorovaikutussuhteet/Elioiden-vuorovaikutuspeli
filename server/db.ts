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
const url = new URL(getConnectionString());
const useSsl = /^(require|verify-ca|verify-full)$/i.test(
  url.searchParams.get("sslmode") ?? "",
);
if (useSsl) {
  url.searchParams.delete("sslmode");
}

/* Shared PostgreSQL connection pool for database queries. */
export const pool = new Pool({
  connectionString: url.toString(),
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

/* Ensures profiles and game_configs exist and migrates single-profile game_configs in place. */
export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS profiles (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(128) NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE UNIQUE INDEX IF NOT EXISTS profiles_single_active
      ON profiles (is_active) WHERE is_active = true;

    INSERT INTO profiles (id, name, is_active)
    SELECT 'default', 'Default', NOT EXISTS (SELECT 1 FROM profiles WHERE is_active = true)
    WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE id = 'default');

    CREATE TABLE IF NOT EXISTS game_configs (
      profile_id VARCHAR(64) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      domain VARCHAR(64) NOT NULL,
      config JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (profile_id, domain)
    );

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'game_configs'
          AND column_name = 'profile_id'
      ) THEN
        ALTER TABLE game_configs
          ADD COLUMN profile_id VARCHAR(64) NOT NULL DEFAULT 'default'
            REFERENCES profiles(id) ON DELETE CASCADE,
          DROP CONSTRAINT game_configs_pkey,
          ADD PRIMARY KEY (profile_id, domain);
        ALTER TABLE game_configs ALTER COLUMN profile_id DROP DEFAULT;
      END IF;
    END $$;
  `);
}
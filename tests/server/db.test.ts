import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockQuery, PoolMock } = vi.hoisted(() => {
  const mockQuery = vi.fn();
  const PoolMock = vi.fn(function () {
    return { query: mockQuery };
  });
  return { mockQuery, PoolMock };
});

vi.mock("pg", () => ({
  Pool: PoolMock,
}));

describe("db", () => {
  beforeEach(() => {
    vi.resetModules();
    PoolMock.mockClear();
    mockQuery.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("connection", () => {
    it("throws when DATABASE_URL is missing in production", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("DATABASE_URL", "");

      await expect(import("../../server/db")).rejects.toThrow(
        "Missing required environment variable: DATABASE_URL",
      );
    });

    it("falls back to local dev URL when DATABASE_URL is unset in test", async () => {
      vi.stubEnv("NODE_ENV", "test");
      vi.stubEnv("DATABASE_URL", "");

      await import("../../server/db");

      expect(PoolMock).toHaveBeenCalledWith({
        connectionString:
          "postgresql://eliopeli:devpassword@localhost:5432/eliopeli",
        ssl: false,
      });
    });

    it("disables SSL for local non-SSL connection strings", async () => {
      const connectionString =
        "postgresql://postgres:postgres@db:5432/eliopeli";
      vi.stubEnv("DATABASE_URL", connectionString);

      await import("../../server/db");

      expect(PoolMock).toHaveBeenCalledWith({
        connectionString,
        ssl: false,
      });
    });

    it("enables SSL and strips sslmode when sslmode=require is set", async () => {
      const base =
        "postgresql://eliopeli_staging:secret@possu-test.it.helsinki.fi:5432/eliopeli_staging";
      vi.stubEnv("DATABASE_URL", `${base}?sslmode=require`);

      await import("../../server/db");

      expect(PoolMock).toHaveBeenCalledWith({
        connectionString: base,
        ssl: { rejectUnauthorized: false },
      });
    });
  });

  describe("initDb", () => {
    beforeEach(() => {
      vi.stubEnv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/test",
      );
    });

    it("creates profiles, game_configs with composite PK, and seeds default profile", async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
      const { initDb } = await import("../../server/db");

      await initDb();

      const executedSql = mockQuery.mock.calls
        .map(([sql]) => String(sql))
        .join("\n");

      expect(executedSql).toContain("CREATE TABLE IF NOT EXISTS profiles");
      expect(executedSql).toContain("CREATE TABLE IF NOT EXISTS game_configs");
      expect(executedSql).toContain("PRIMARY KEY (profile_id, domain)");
      expect(executedSql).toContain("config JSONB NOT NULL");
      expect(executedSql).toContain("'default'");
    });

    it("propagates database errors when query fails", async () => {
      mockQuery.mockRejectedValueOnce(new Error("Connection failed"));
      const { initDb } = await import("../../server/db");

      await expect(initDb()).rejects.toThrow("Connection failed");
    });

    it("clears default profile rows from game_configs", async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
      const { initDb } = await import("../../server/db");

      await initDb();

      const executedSql = mockQuery.mock.calls
        .map(([sql]) => String(sql))
        .join("\n");

      expect(executedSql).toContain(
        "DELETE FROM game_configs WHERE profile_id = 'default'",
      );
    });
  });
});

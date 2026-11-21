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
        connectionString: "postgresql://eliopeli:devpassword@localhost:5432/eliopeli",
        ssl: false,
      });
    });

    it("disables SSL for local non-SSL connection strings", async () => {
      const connectionString = "postgresql://postgres:postgres@db:5432/eliopeli";
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
      vi.stubEnv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/test");
    });

    it("executes CREATE TABLE IF NOT EXISTS game_configs query", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const { initDb } = await import("../../server/db");

      await initDb();

      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("CREATE TABLE IF NOT EXISTS game_configs"),
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("domain VARCHAR(64) PRIMARY KEY"),
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("config JSONB NOT NULL"),
      );
    });

    it("propagates database errors when query fails", async () => {
      mockQuery.mockRejectedValueOnce(new Error("Connection failed"));
      const { initDb } = await import("../../server/db");

      await expect(initDb()).rejects.toThrow("Connection failed");
    });
  });
});
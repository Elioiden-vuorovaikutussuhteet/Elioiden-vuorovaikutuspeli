import { describe, it, expect, vi, beforeEach, type MockInstance } from "vitest";
import { pool, initDb } from "../../server/db";

describe("db", () => {
  let mockQuery: MockInstance;

  beforeEach(() => {
    mockQuery = vi.spyOn(pool, "query") as unknown as MockInstance;
  });

  describe("initDb", () => {
    it("executes CREATE TABLE IF NOT EXISTS game_configs query", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 });

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

      await expect(initDb()).rejects.toThrow("Connection failed");
    });
  });
});
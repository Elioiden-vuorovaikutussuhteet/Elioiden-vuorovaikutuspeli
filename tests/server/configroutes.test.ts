import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  type MockInstance,
} from "vitest";
import express from "express";
import type { AddressInfo } from "net";
import { pool } from "../../server/db";
import configRouter from "../../server/configRoutes";
import { permanentArrowUIConfig } from "../../src/game/config/arrowConfig";

let mockQuery: MockInstance;

function createTestApp(isAdmin = false) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.session = (isAdmin ? { user: { isAdmin: true } } : {}) as any;
    next();
  });
  app.use("/api/configs", configRouter);
  return app;
}

async function request(
  app: express.Express,
  path: string,
  options?: RequestInit,
) {
  const server = app.listen(0);
  const { port } = server.address() as AddressInfo;
  try {
    const res = await fetch(`http://127.0.0.1:${port}${path}`, options);
    const body = await res.json();
    return { status: res.status, body };
  } finally {
    server.close();
  }
}

describe("configRoutes", () => {
  beforeEach(() => {
    mockQuery = vi.spyOn(pool, "query") as unknown as MockInstance;
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("GET /api/configs", () => {
    it("returns merged database overrides and defaults", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ domain: "permanentArrow", config: { pulseDuration: 9999 } }],
      });

      const { status, body } = await request(createTestApp(), "/api/configs");

      expect(status).toBe(200);
      expect(body.permanentArrow.pulseDuration).toBe(9999);
      expect(body.permanentArrow.movementEpsilon).toBe(
        permanentArrowUIConfig.movementEpsilon,
      );
      expect(body.camera).toBeDefined();
    });

    it("falls back to defaults if stored DB config fails Zod validation", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [
          { domain: "permanentArrow", config: { pulseDuration: "invalid" } },
        ],
      });

      const { status, body } = await request(createTestApp(), "/api/configs");

      expect(status).toBe(200);
      expect(body.permanentArrow.pulseDuration).toBe(
        permanentArrowUIConfig.pulseDuration,
      );
    });

    it("returns 500 when database query fails", async () => {
      mockQuery.mockRejectedValueOnce(new Error("DB error"));

      const { status, body } = await request(createTestApp(), "/api/configs");

      expect(status).toBe(500);
      expect(body.error).toBe("Failed to fetch configurations");
    });
  });

  describe("GET /api/configs/:domain", () => {
    it("returns 404 for an unknown section", async () => {
      const { status, body } = await request(
        createTestApp(),
        "/api/configs/unknownSection",
      );

      expect(status).toBe(404);
      expect(body.error).toContain("Unknown config section");
    });

    it("returns defaults when no override exists in DB", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const { status, body } = await request(
        createTestApp(),
        "/api/configs/permanentArrow",
      );

      expect(status).toBe(200);
      expect(body).toEqual(permanentArrowUIConfig);
    });

    it("returns merged config when DB override exists", async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ config: { pulseDuration: 2500 } }],
      });

      const { status, body } = await request(
        createTestApp(),
        "/api/configs/permanentArrow",
      );

      expect(status).toBe(200);
      expect(body.pulseDuration).toBe(2500);
    });
  });

  describe("PUT /api/configs/:domain", () => {
    it("returns 401 when user is not an admin", async () => {
      const { status, body } = await request(
        createTestApp(false),
        "/api/configs/permanentArrow",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pulseDuration: 1500 }),
        },
      );

      expect(status).toBe(401);
      expect(body.error).toBe("Unauthorized");
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("returns 400 when payload fails Zod validation", async () => {
      const { status, body } = await request(
        createTestApp(true),
        "/api/configs/permanentArrow",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pulseDuration: "not-a-number" }),
        },
      );

      expect(status).toBe(400);
      expect(body.error).toBe("Invalid configuration payload");
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("upserts valid config and returns updated row", async () => {
      const updatedConfig = {
        ...permanentArrowUIConfig,
        pulseDuration: 1500,
      };
      mockQuery.mockResolvedValueOnce({
        rows: [
          { config: updatedConfig, updated_at: "2026-11-15T20:00:00.000Z" },
        ],
      });

      const { status, body } = await request(
        createTestApp(true),
        "/api/configs/permanentArrow",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pulseDuration: 1500 }),
        },
      );

      expect(status).toBe(200);
      expect(body.domain).toBe("permanentArrow");
      expect(body.config.pulseDuration).toBe(1500);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO game_configs"),
        ["permanentArrow", JSON.stringify(updatedConfig)],
      );
    });
  });

  describe("DELETE /api/configs/:domain", () => {
    it("returns 401 when user is not an admin", async () => {
      const { status } = await request(
        createTestApp(false),
        "/api/configs/permanentArrow",
        { method: "DELETE" },
      );

      expect(status).toBe(401);
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("deletes DB override and returns section defaults", async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });

      const { status, body } = await request(
        createTestApp(true),
        "/api/configs/permanentArrow",
        { method: "DELETE" },
      );

      expect(status).toBe(200);
      expect(body).toEqual({
        domain: "permanentArrow",
        config: permanentArrowUIConfig,
        reset: true,
      });
      expect(mockQuery).toHaveBeenCalledWith(
        "DELETE FROM game_configs WHERE domain = $1",
        ["permanentArrow"],
      );
    });
  });
});

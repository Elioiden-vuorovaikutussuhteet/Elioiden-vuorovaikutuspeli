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
    req.session = (
      isAdmin ? { user: { id: "admin", isAdmin: true } } : {}
    ) as any;
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
    it("returns merged database overrides and defaults for active profile", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: "default" }] })
        .mockResolvedValueOnce({
          rows: [{ domain: "permanentArrow", config: { pulseDuration: 9999 } }],
        });

      const { status, body } = await request(createTestApp(), "/api/configs");

      expect(status).toBe(200);
      expect(body.permanentArrow.pulseDuration).toBe(9999);
      expect(body.permanentArrow.movementEpsilon).toBe(
        permanentArrowUIConfig.movementEpsilon,
      );
      expect(body.camera).toBeDefined();
      expect(mockQuery).toHaveBeenLastCalledWith(
        "SELECT domain, config FROM game_configs WHERE profile_id = $1",
        ["default"],
      );
    });

    it("scopes query when ?profile= is provided", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: "bio-1" }] })
        .mockResolvedValueOnce({ rows: [] });

      const { status } = await request(
        createTestApp(),
        "/api/configs?profile=bio-1",
      );

      expect(status).toBe(200);
      expect(mockQuery).toHaveBeenLastCalledWith(
        "SELECT domain, config FROM game_configs WHERE profile_id = $1",
        ["bio-1"],
      );
    });

    it("returns 404 when requested ?profile= does not exist", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const { status, body } = await request(
        createTestApp(),
        "/api/configs?profile=missing",
      );

      expect(status).toBe(404);
      expect(body.error).toContain("Unknown profile");
    });

    it("falls back to defaults if stored DB config fails Zod validation", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: "default" }] })
        .mockResolvedValueOnce({
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
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: "default" }] })
        .mockResolvedValueOnce({ rows: [] });

      const { status, body } = await request(
        createTestApp(),
        "/api/configs/permanentArrow",
      );

      expect(status).toBe(200);
      expect(body).toEqual(permanentArrowUIConfig);
    });

    it("returns merged config when DB override exists", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: "default" }] })
        .mockResolvedValueOnce({
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

  describe("PUT /api/configs/:profileId/:domain", () => {
    it("returns 401 when user is not an admin", async () => {
      const { status, body } = await request(
        createTestApp(false),
        "/api/configs/default/permanentArrow",
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

    it("returns 403 when updating the default profile", async () => {
      const { status, body } = await request(
        createTestApp(true),
        "/api/configs/default/permanentArrow",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pulseDuration: 1500 }),
        },
      );

      expect(status).toBe(403);
      expect(body.error).toBe("Default profile is read-only");
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("returns 400 when payload fails Zod validation", async () => {
      const { status, body } = await request(
        createTestApp(true),
        "/api/configs/bio-1/permanentArrow",
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

    it("returns 404 on FK violation for unknown profile", async () => {
      mockQuery.mockRejectedValueOnce({ code: "23503" });

      const { status, body } = await request(
        createTestApp(true),
        "/api/configs/missing/permanentArrow",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pulseDuration: 1500 }),
        },
      );

      expect(status).toBe(404);
      expect(body.error).toContain("Unknown profile");
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
        "/api/configs/bio-1/permanentArrow",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pulseDuration: 1500 }),
        },
      );

      expect(status).toBe(200);
      expect(body.profileId).toBe("bio-1");
      expect(body.domain).toBe("permanentArrow");
      expect(body.config.pulseDuration).toBe(1500);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO game_configs"),
        ["bio-1", "permanentArrow", JSON.stringify(updatedConfig)],
      );
    });
  });

  describe("DELETE /api/configs/:profileId/:domain", () => {
    it("returns 401 when user is not an admin", async () => {
      const { status } = await request(
        createTestApp(false),
        "/api/configs/default/permanentArrow",
        { method: "DELETE" },
      );

      expect(status).toBe(401);
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("returns 403 when deleting from the default profile", async () => {
      const { status, body } = await request(
        createTestApp(true),
        "/api/configs/default/permanentArrow",
        { method: "DELETE" },
      );

      expect(status).toBe(403);
      expect(body.error).toBe("Default profile is read-only");
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it("returns 404 for unknown profile", async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const { status, body } = await request(
        createTestApp(true),
        "/api/configs/missing/permanentArrow",
        { method: "DELETE" },
      );

      expect(status).toBe(404);
      expect(body.error).toContain("Unknown profile");
    });

    it("deletes DB override and returns section defaults", async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: "bio-1" }] })
        .mockResolvedValueOnce({ rowCount: 1 });

      const { status, body } = await request(
        createTestApp(true),
        "/api/configs/bio-1/permanentArrow",
        { method: "DELETE" },
      );

      expect(status).toBe(200);
      expect(body).toEqual({
        profileId: "bio-1",
        domain: "permanentArrow",
        config: permanentArrowUIConfig,
        reset: true,
      });
      expect(mockQuery).toHaveBeenLastCalledWith(
        "DELETE FROM game_configs WHERE profile_id = $1 AND domain = $2",
        ["bio-1", "permanentArrow"],
      );
    });
  });
});

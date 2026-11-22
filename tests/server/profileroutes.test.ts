import express from "express";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const { mockQuery, mockConnect, mockClient } = vi.hoisted(() => {
  const client = {
    query: vi.fn(),
    release: vi.fn(),
  };
  return {
    mockQuery: vi.fn(),
    mockConnect: vi.fn().mockResolvedValue(client),
    mockClient: client,
  };
});

vi.mock("../../server/db", () => ({
  pool: { query: mockQuery, connect: mockConnect },
}));

import { profileRoutes } from "../../server/profileRoutes";

const ADMIN = { "x-test-admin": "true" };
const JSON_ADMIN = { "Content-Type": "application/json", ...ADMIN };

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.session = (
      req.headers["x-test-admin"] === "true"
        ? { user: { id: "admin", isAdmin: true } }
        : {}
    ) as typeof req.session;
    next();
  });
  app.use("/api/profiles", profileRoutes);

  app.use(
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error("profileRoutes test error:", err);
      res.status(500).json({ error: String(err) });
    },
  );

  server = await new Promise<Server>((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(
  () =>
    new Promise<void>((res, rej) => server.close((e) => (e ? rej(e) : res()))),
);

beforeEach(() => {
  vi.clearAllMocks();
  mockConnect.mockResolvedValue(mockClient);
});

describe("profileRoutes", () => {
  it("GET /api/profiles returns all profiles", async () => {
    const rows = [
      {
        id: "default",
        name: "Default",
        is_active: true,
        created_at: "2026-11-22T00:00:00Z",
      },
    ];
    mockQuery.mockResolvedValueOnce({ rows });

    const res = await fetch(`${baseUrl}/api/profiles`);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(rows);
  });

  it("POST /api/profiles rejects unauthenticated requests with 401", async () => {
    const res = await fetch(`${baseUrl}/api/profiles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "bio-1", name: "Bio 1" }),
    });

    expect(res.status).toBe(401);
    expect(mockConnect).not.toHaveBeenCalled();
  });

  it("POST /api/profiles validates slug format", async () => {
    const res = await fetch(`${baseUrl}/api/profiles`, {
      method: "POST",
      headers: JSON_ADMIN,
      body: JSON.stringify({ id: "Invalid Slug!", name: "Bad" }),
    });

    expect(res.status).toBe(400);
    expect(mockConnect).not.toHaveBeenCalled();
  });

  it("POST /api/profiles creates a profile and clones configs when cloneFrom is set", async () => {
    const created = {
      id: "bio-1",
      name: "Bio 1",
      is_active: false,
      created_at: "2026-11-22",
    };
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [created] }) // INSERT profiles
      .mockResolvedValueOnce({}) // INSERT cloned game_configs
      .mockResolvedValueOnce({}); // COMMIT

    const res = await fetch(`${baseUrl}/api/profiles`, {
      method: "POST",
      headers: JSON_ADMIN,
      body: JSON.stringify({
        id: "bio-1",
        name: "Bio 1",
        cloneFrom: "default",
      }),
    });

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(created);
    expect(mockClient.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO game_configs"),
      ["bio-1", "default"],
    );
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });

  it("POST /api/profiles rolls back and returns 409 on duplicate ID", async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockRejectedValueOnce({ code: "23505" }) // INSERT duplicate
      .mockResolvedValueOnce({}); // ROLLBACK

    const res = await fetch(`${baseUrl}/api/profiles`, {
      method: "POST",
      headers: JSON_ADMIN,
      body: JSON.stringify({ id: "default", name: "Duplicate" }),
    });

    expect(res.status).toBe(409);
    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });

  it("PATCH /api/profiles/:id activates a profile inside a transaction", async () => {
    const updated = {
      id: "bio-1",
      name: "Bio 1",
      is_active: true,
      created_at: "2026-11-22",
    };
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({}) // deactivate previous
      .mockResolvedValueOnce({ rows: [updated] }) // activate target
      .mockResolvedValueOnce({}); // COMMIT

    const res = await fetch(`${baseUrl}/api/profiles/bio-1`, {
      method: "PATCH",
      headers: JSON_ADMIN,
      body: JSON.stringify({ is_active: true }),
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(updated);
    expect(mockClient.query).toHaveBeenCalledWith(
      "UPDATE profiles SET is_active = false WHERE is_active = true",
    );
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });

  it("PATCH /api/profiles/:id rolls back and returns 404 when profile is missing", async () => {
    mockClient.query
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows: [] }) // UPDATE returning nothing
      .mockResolvedValueOnce({}); // ROLLBACK

    const res = await fetch(`${baseUrl}/api/profiles/missing`, {
      method: "PATCH",
      headers: JSON_ADMIN,
      body: JSON.stringify({ name: "Renamed" }),
    });

    expect(res.status).toBe(404);
    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.release).toHaveBeenCalledTimes(1);
  });

  it("DELETE /api/profiles/default rejects deleting the default profile", async () => {
    const res = await fetch(`${baseUrl}/api/profiles/default`, {
      method: "DELETE",
      headers: ADMIN,
    });

    expect(res.status).toBe(400);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("DELETE /api/profiles/:id rejects deleting the currently active profile", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ is_active: true }] });

    const res = await fetch(`${baseUrl}/api/profiles/bio-1`, {
      method: "DELETE",
      headers: ADMIN,
    });

    expect(res.status).toBe(400);
  });

  it("DELETE /api/profiles/:id deletes an inactive non-default profile", async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ is_active: false }] })
      .mockResolvedValueOnce({});

    const res = await fetch(`${baseUrl}/api/profiles/bio-1`, {
      method: "DELETE",
      headers: ADMIN,
    });

    expect(res.status).toBe(204);
    expect(mockQuery).toHaveBeenLastCalledWith(
      "DELETE FROM profiles WHERE id = $1",
      ["bio-1"],
    );
  });
});

import { Router } from "express";
import { z } from "zod";
import { pool } from "./db";
import { requireAdmin } from "./auth"; // adjust to your auth middleware path

const createProfileSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/).min(1).max(64),
  name: z.string().trim().min(1).max(128),
  cloneFrom: z.string().min(1).max(64).optional(),
});

const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(128).optional(),
    is_active: z.literal(true).optional(),
  })
  .refine((data) => data.name !== undefined || data.is_active !== undefined, {
    message: "Provide name and/or is_active: true",
  });

export const profileRoutes = Router();

profileRoutes.get("/", async (_req, res) => {
  const { rows } = await pool.query(
    "SELECT id, name, is_active, created_at FROM profiles ORDER BY created_at ASC",
  );
  res.json(rows);
});

profileRoutes.post("/", requireAdmin, async (req, res) => {
  const parsed = createProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid profile" });
    return;
  }

  const { id, name, cloneFrom } = parsed.data;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      "INSERT INTO profiles (id, name) VALUES ($1, $2) RETURNING id, name, is_active, created_at",
      [id, name],
    );

    if (cloneFrom) {
      await client.query(
        `INSERT INTO game_configs (profile_id, domain, config)
         SELECT $1, domain, config FROM game_configs WHERE profile_id = $2`,
        [id, cloneFrom],
      );
    }

    await client.query("COMMIT");
    res.status(201).json(rows[0]);
  } catch (err: unknown) {
    await client.query("ROLLBACK");
    if ((err as { code?: string }).code === "23505") {
      res.status(409).json({ error: "Profile ID already exists." });
      return;
    }
    throw err;
  } finally {
    client.release();
  }
});

profileRoutes.patch("/:profileId", requireAdmin, async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid update" });
    return;
  }

  const { profileId } = req.params;
  const { name, is_active } = parsed.data;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    if (is_active) {
      await client.query("UPDATE profiles SET is_active = false WHERE is_active = true");
    }

    const { rows } = await client.query(
      `UPDATE profiles
       SET name = COALESCE($2, name),
           is_active = CASE WHEN $3::boolean THEN true ELSE is_active END
       WHERE id = $1
       RETURNING id, name, is_active, created_at`,
      [profileId, name ?? null, Boolean(is_active)],
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      res.status(404).json({ error: "Profile not found." });
      return;
    }

    await client.query("COMMIT");
    res.json(rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

profileRoutes.delete("/:profileId", requireAdmin, async (req, res) => {
  const { profileId } = req.params;
  if (profileId === "default") {
    res.status(400).json({ error: "Cannot delete the default profile." });
    return;
  }

  const { rows } = await pool.query(
    "SELECT is_active FROM profiles WHERE id = $1",
    [profileId],
  );
  if (rows.length === 0) {
    res.status(404).json({ error: "Profile not found." });
    return;
  }
  if (rows[0].is_active) {
    res.status(400).json({ error: "Cannot delete the active profile." });
    return;
  }

  await pool.query("DELETE FROM profiles WHERE id = $1", [profileId]);
  res.sendStatus(204);
});
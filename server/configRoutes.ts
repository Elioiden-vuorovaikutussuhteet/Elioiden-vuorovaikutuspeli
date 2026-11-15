import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { pool } from "./db";
import { configRegistry } from "../src/game/config/configRegistry";

const router = Router();

/* Metadata and schema definition for a registered configuration section. */
interface SectionEntry {
  categoryId: string;
  id: string;
  label: string;
  schema: z.ZodTypeAny;
  defaults: Record<string, unknown>;
}

/* Flattened lookup map of config sections with cloned defaults to prevent runtime mutation. */
const sectionMap = new Map<string, SectionEntry>();

for (const category of configRegistry) {
  for (const section of category.sections) {
    sectionMap.set(section.id, {
      categoryId: category.id,
      id: section.id,
      label: section.label,
      schema: section.schema,
      defaults: structuredClone(section.defaults) as Record<string, unknown>,
    });
  }
}

/* Middleware that restricts route access to authenticated admin sessions. */
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user?.isAdmin) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

/* GET /api/configs - Returns all config sections, merging database overrides with defaults. */
router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query<{
      domain: string;
      config: Record<string, unknown>;
    }>("SELECT domain, config FROM game_configs");

    const dbMap = new Map(rows.map((r) => [r.domain, r.config]));
    const result: Record<string, unknown> = {};

    for (const [id, entry] of sectionMap.entries()) {
      const dbConfig = dbMap.get(id);
      if (dbConfig) {
        const parsed = entry.schema.safeParse({
          ...entry.defaults,
          ...dbConfig,
        });
        result[id] = parsed.success ? parsed.data : entry.defaults;
      } else {
        result[id] = entry.defaults;
      }
    }

    res.json(result);
  } catch (err) {
    console.error("Failed to fetch configs:", err);
    res.status(500).json({ error: "Failed to fetch configurations" });
  }
});

/* GET /api/configs/:domain - Returns a single config section by ID, falling back to defaults. */
router.get("/:domain", async (req, res) => {
  const { domain } = req.params;
  const entry = sectionMap.get(domain);

  if (!entry) {
    return res.status(404).json({ error: `Unknown config section: ${domain}` });
  }

  try {
    const { rows } = await pool.query<{ config: Record<string, unknown> }>(
      "SELECT config FROM game_configs WHERE domain = $1",
      [domain],
    );

    if (rows.length === 0) {
      return res.json(entry.defaults);
    }

    const parsed = entry.schema.safeParse({
      ...entry.defaults,
      ...rows[0].config,
    });
    return res.json(parsed.success ? parsed.data : entry.defaults);
  } catch (err) {
    console.error(`Failed to fetch config [${domain}]:`, err);
    res.status(500).json({ error: "Failed to fetch configuration" });
  }
});

/* PUT /api/configs/:domain - Validates and upserts a config section override into PostgreSQL. */
router.put<{ domain: string }>("/:domain", requireAdmin, async (req, res) => {
  const { domain } = req.params;
  const entry = sectionMap.get(domain);

  if (!entry) {
    return res.status(404).json({ error: `Unknown config section: ${domain}` });
  }

  const candidate = { ...entry.defaults, ...req.body };
  const parsed = entry.schema.safeParse(candidate);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid configuration payload",
      details: parsed.error.flatten(),
    });
  }

  try {
    const { rows } = await pool.query<{ config: unknown; updated_at: string }>(
      `INSERT INTO game_configs (domain, config, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (domain)
       DO UPDATE SET config = EXCLUDED.config, updated_at = NOW()
       RETURNING config, updated_at`,
      [domain, JSON.stringify(parsed.data)],
    );

    res.json({
      domain,
      config: rows[0].config,
      updatedAt: rows[0].updated_at,
    });
  } catch (err) {
    console.error(`Failed to update config [${domain}]:`, err);
    res.status(500).json({ error: "Failed to save configuration" });
  }
});

/* DELETE /api/configs/:domain - Removes stored overrides for a section to restore defaults. */
router.delete<{ domain: string }>("/:domain", requireAdmin, async (req, res) => {
  const { domain } = req.params;
  const entry = sectionMap.get(domain);

  if (!entry) {
    return res.status(404).json({ error: `Unknown config section: ${domain}` });
  }

  try {
    await pool.query("DELETE FROM game_configs WHERE domain = $1", [domain]);
    res.json({ domain, config: entry.defaults, reset: true });
  } catch (err) {
    console.error(`Failed to reset config [${domain}]:`, err);
    res.status(500).json({ error: "Failed to reset configuration" });
  }
});

export default router;
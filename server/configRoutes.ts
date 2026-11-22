import { Router } from "express";
import { z } from "zod";
import { pool } from "./db";
import { requireAdmin } from "./auth";
import { configRegistry } from "../src/game/config/configRegistry";
import { deepMerge } from "./utils/deepMerge";

const router = Router();

interface SectionEntry {
  categoryId: string;
  id: string;
  label: string;
  schema: z.ZodType;
  defaults: Record<string, unknown> | null;
  replace?: boolean;
}

const ecosystemSchema = z.object({
  organisms: z.array(z.record(z.string(), z.unknown())),
  relations: z.array(
    z.object({ source: z.string(), target: z.string() }).passthrough(),
  ),
  popupTexts: z.record(z.string(), z.record(z.string(), z.unknown())),
});

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

sectionMap.set("ecosystem", {
  categoryId: "ecosystem",
  id: "ecosystem",
  label: "Ecosystem",
  schema: ecosystemSchema,
  defaults: null,
  replace: true,
});

function buildCandidate(
  entry: SectionEntry,
  payload: Record<string, unknown>,
): unknown {
  return entry.replace || entry.defaults === null
    ? payload
    : deepMerge(entry.defaults, payload);
}

function resolveConfig(
  entry: SectionEntry,
  dbConfig?: Record<string, unknown>,
): unknown {
  if (!dbConfig) return entry.defaults;
  const parsed = entry.schema.safeParse(buildCandidate(entry, dbConfig));
  return parsed.success ? parsed.data : entry.defaults;
}

async function resolveProfileId(requested?: string): Promise<string | null> {
  if (requested) {
    const { rows } = await pool.query<{ id: string }>(
      "SELECT id FROM profiles WHERE id = $1",
      [requested],
    );
    return rows[0]?.id ?? null;
  }
  const { rows } = await pool.query<{ id: string }>(
    "SELECT id FROM profiles WHERE is_active = true LIMIT 1",
  );
  return rows[0]?.id ?? "default";
}

function getQueryProfile(raw: unknown): string | undefined {
  return typeof raw === "string" && raw.length > 0 ? raw : undefined;
}

/* GET /api/configs?profile=<id> - Returns all sections for the requested or active profile. */
router.get("/", async (req, res) => {
  try {
    const requested = getQueryProfile(req.query.profile);
    const profileId = await resolveProfileId(requested);
    if (!profileId) {
      res.status(404).json({ error: `Unknown profile: ${requested}` });
      return;
    }

    const { rows } = await pool.query<{
      domain: string;
      config: Record<string, unknown>;
    }>("SELECT domain, config FROM game_configs WHERE profile_id = $1", [
      profileId,
    ]);

    const dbMap = new Map(rows.map((r) => [r.domain, r.config]));
    const result: Record<string, unknown> = {};

    for (const [id, entry] of sectionMap.entries()) {
      result[id] = resolveConfig(entry, dbMap.get(id));
    }

    res.json(result);
  } catch (err) {
    console.error("Failed to fetch configs:", err);
    res.status(500).json({ error: "Failed to fetch configurations" });
  }
});

/* GET /api/configs/:domain?profile=<id> - Returns a single section for the requested or active profile. */
router.get("/:domain", async (req, res) => {
  const { domain } = req.params;
  const entry = sectionMap.get(domain);

  if (!entry) {
    res.status(404).json({ error: `Unknown config section: ${domain}` });
    return;
  }

  try {
    const requested = getQueryProfile(req.query.profile);
    const profileId = await resolveProfileId(requested);
    if (!profileId) {
      res.status(404).json({ error: `Unknown profile: ${requested}` });
      return;
    }

    const { rows } = await pool.query<{ config: Record<string, unknown> }>(
      "SELECT config FROM game_configs WHERE profile_id = $1 AND domain = $2",
      [profileId, domain],
    );

    res.json(resolveConfig(entry, rows[0]?.config));
  } catch (err) {
    console.error(`Failed to fetch config [${domain}]:`, err);
    res.status(500).json({ error: "Failed to fetch configuration" });
  }
});

/* PUT /api/configs/:profileId/:domain - Validates and upserts a section override for a profile. */
router.put<{ profileId: string; domain: string }>(
  "/:profileId/:domain",
  requireAdmin,
  async (req, res) => {
    const { profileId, domain } = req.params;
    const entry = sectionMap.get(domain);

    if (!entry) {
      res.status(404).json({ error: `Unknown config section: ${domain}` });
      return;
    }

    const parsed = entry.schema.safeParse(buildCandidate(entry, req.body));
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid configuration payload",
        details: parsed.error.flatten(),
      });
      return;
    }

    try {
      const { rows } = await pool.query<{ config: unknown; updated_at: string }>(
        `INSERT INTO game_configs (profile_id, domain, config, updated_at)
         VALUES ($1, $2, $3::jsonb, NOW())
         ON CONFLICT (profile_id, domain)
         DO UPDATE SET config = EXCLUDED.config, updated_at = NOW()
         RETURNING config, updated_at`,
        [profileId, domain, JSON.stringify(parsed.data)],
      );

      res.json({
        profileId,
        domain,
        config: rows[0].config,
        updatedAt: rows[0].updated_at,
      });
    } catch (err: unknown) {
      if ((err as { code?: string }).code === "23503") {
        res.status(404).json({ error: `Unknown profile: ${profileId}` });
        return;
      }
      console.error(`Failed to update config [${profileId}/${domain}]:`, err);
      res.status(500).json({ error: "Failed to save configuration" });
    }
  },
);

/* DELETE /api/configs/:profileId/:domain - Resets a section in a profile back to defaults. */
router.delete<{ profileId: string; domain: string }>(
  "/:profileId/:domain",
  requireAdmin,
  async (req, res) => {
    const { profileId, domain } = req.params;
    const entry = sectionMap.get(domain);

    if (!entry) {
      res.status(404).json({ error: `Unknown config section: ${domain}` });
      return;
    }

    try {
      if (!(await resolveProfileId(profileId))) {
        res.status(404).json({ error: `Unknown profile: ${profileId}` });
        return;
      }

      await pool.query(
        "DELETE FROM game_configs WHERE profile_id = $1 AND domain = $2",
        [profileId, domain],
      );
      res.json({ profileId, domain, config: entry.defaults, reset: true });
    } catch (err) {
      console.error(`Failed to reset config [${profileId}/${domain}]:`, err);
      res.status(500).json({ error: "Failed to reset configuration" });
    }
  },
);

export default router;
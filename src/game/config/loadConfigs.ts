import { configRegistry } from "./configRegistry";
import { deepMerge } from "../utils/deepMerge";

/* Snapshot of initial code defaults taken before any database overrides are applied. */
const initialDefaults = new Map<string, Record<string, unknown>>();

for (const category of configRegistry) {
  for (const section of category.sections) {
    initialDefaults.set(
      section.id,
      structuredClone(section.defaults) as Record<string, unknown>,
    );
  }
}

/* Validates and merges a config payload in-place into the live config section object. */
export function applySectionConfig(
  sectionId: string,
  data: Record<string, unknown>,
): boolean {
  for (const category of configRegistry) {
    for (const section of category.sections) {
      if (section.id === sectionId) {
        const base = initialDefaults.get(sectionId) ?? section.defaults;
        const merged = deepMerge(base, data);
        const parsed = section.schema.safeParse(merged);
        if (parsed.success) {
          Object.assign(section.defaults, parsed.data);
          return true;
        }
        return false;
      }
    }
  }
  return false;
}

/* Restores a live config section object in-place to its initial TypeScript defaults. */
export function resetSectionConfig(sectionId: string): void {
  const base = initialDefaults.get(sectionId);
  if (!base) return;

  for (const category of configRegistry) {
    for (const section of category.sections) {
      if (section.id === sectionId) {
        Object.assign(section.defaults, structuredClone(base));
        return;
      }
    }
  }
}

/* Fetches all saved configs from the backend API and hydrates the live config objects on startup. */
export async function loadConfigsFromServer(): Promise<void> {
  try {
    const res = await fetch("/api/configs");
    if (!res.ok) {
      console.warn(`Failed to fetch configs (${res.status}), using defaults.`);
      return;
    }

    const data = (await res.json()) as Record<string, Record<string, unknown>>;

    for (const [sectionId, sectionData] of Object.entries(data)) {
      if (sectionData && typeof sectionData === "object") {
        applySectionConfig(sectionId, sectionData);
      }
    }
  } catch (err) {
    console.warn("Could not load configs from server, using defaults:", err);
  }
}

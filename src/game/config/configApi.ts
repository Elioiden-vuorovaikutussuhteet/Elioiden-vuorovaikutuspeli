import { applySectionConfig, resetSectionConfig } from "./loadConfigs";

export async function saveConfigSection(
  domain: string,
  draft: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const res = await fetch(`/api/configs/${domain}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(draft),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Failed to save ${domain} (${res.status})`);
  }

  applySectionConfig(domain, data.config);
  return data.config;
}

export async function deleteConfigSection(
  domain: string,
): Promise<Record<string, unknown>> {
  const res = await fetch(`/api/configs/${domain}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Failed to reset ${domain} (${res.status})`);
  }

  resetSectionConfig(domain);
  return data.config;
}
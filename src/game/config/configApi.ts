import { applySectionConfig, resetSectionConfig } from "./loadConfigs";

export interface Profile {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    cache: "no-store",
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export function fetchProfiles(): Promise<Profile[]> {
  return apiRequest<Profile[]>("/api/profiles");
}

export function createProfile(payload: {
  id: string;
  name: string;
  cloneFrom?: string;
}): Promise<Profile> {
  return apiRequest<Profile>("/api/profiles", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProfile(
  profileId: string,
  payload: { name?: string; is_active?: true },
): Promise<Profile> {
  return apiRequest<Profile>(`/api/profiles/${encodeURIComponent(profileId)}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteProfile(profileId: string): Promise<void> {
  return apiRequest<void>(`/api/profiles/${encodeURIComponent(profileId)}`, {
    method: "DELETE",
  });
}

export function fetchProfileConfigs(
  profileId: string,
): Promise<Record<string, unknown>> {
  return apiRequest<Record<string, unknown>>(
    `/api/configs?profile=${encodeURIComponent(profileId)}`,
  );
}

export async function saveConfigSection(
  profileId: string,
  domain: string,
  draft: Record<string, unknown>,
  syncRuntime = true,
): Promise<Record<string, unknown>> {
  const data = await apiRequest<{ config: Record<string, unknown> }>(
    `/api/configs/${encodeURIComponent(profileId)}/${encodeURIComponent(domain)}`,
    { method: "PUT", body: JSON.stringify(draft) },
  );

  if (syncRuntime) applySectionConfig(domain, data.config);
  return data.config;
}

export async function deleteConfigSection(
  profileId: string,
  domain: string,
  syncRuntime = true,
): Promise<Record<string, unknown> | null> {
  const data = await apiRequest<{ config: Record<string, unknown> | null }>(
    `/api/configs/${encodeURIComponent(profileId)}/${encodeURIComponent(domain)}`,
    { method: "DELETE" },
  );

  if (syncRuntime) resetSectionConfig(domain);
  return data.config;
}
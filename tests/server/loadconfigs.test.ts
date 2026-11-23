import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfigsFromServer } from "../../src/game/config/loadConfigs";

function mockJsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  };
}

describe("loadConfigsFromServer", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", { location: { search: "" } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("fetches /api/configs when no profile param or argument is present", async () => {
    fetchMock.mockResolvedValueOnce(mockJsonResponse({}));

    await loadConfigsFromServer();

    expect(fetchMock).toHaveBeenCalledWith("/api/configs");
  });

  it("reads ?profile from window.location.search and encodes it", async () => {
    vi.stubGlobal("window", {
      location: { search: "?foo=1&profile=lukio%20bio-1" },
    });
    fetchMock.mockResolvedValueOnce(mockJsonResponse({}));

    await loadConfigsFromServer();

    expect(fetchMock).toHaveBeenCalledWith("/api/configs?profile=lukio%20bio-1");
  });

  it("prefers explicit profileId argument over URL query parameter", async () => {
    vi.stubGlobal("window", {
      location: { search: "?profile=from-url" },
    });
    fetchMock.mockResolvedValueOnce(mockJsonResponse({}));

    await loadConfigsFromServer("from-arg");

    expect(fetchMock).toHaveBeenCalledWith("/api/configs?profile=from-arg");
  });

  it("falls back to /api/configs safely when window is undefined", async () => {
    vi.stubGlobal("window", undefined);
    fetchMock.mockResolvedValueOnce(mockJsonResponse({}));

    await loadConfigsFromServer();

    expect(fetchMock).toHaveBeenCalledWith("/api/configs");
  });

  it("warns and resolves cleanly on 404 (unknown profile) response", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    fetchMock.mockResolvedValueOnce(mockJsonResponse({ error: "Not found" }, 404));

    await expect(loadConfigsFromServer("nonexistent")).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      "Failed to fetch configs (404), using defaults.",
    );
  });

  it("warns and resolves cleanly on network failure", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    fetchMock.mockRejectedValueOnce(new Error("ECONNREFUSED"));

    await expect(loadConfigsFromServer()).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      "Could not load configs from server, using defaults:",
      expect.any(Error),
    );
  });
});
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  applySectionConfig,
  resetSectionConfig,
  loadConfigsFromServer,
} from "../../src/game/config/loadConfigs";
import { permanentArrowUIConfig } from "../../src/game/config/arrowConfig";
import { cameraConfig } from "../../src/game/config/cameraConfig";

describe("loadConfigs", () => {
  const defaultPulseDuration = permanentArrowUIConfig.pulseDuration;
  const defaultScaleEpsilon = permanentArrowUIConfig.scaleEpsilon;
  const defaultMinZoom = cameraConfig.minZoom;

  beforeEach(() => {
    resetSectionConfig("permanentArrow");
    resetSectionConfig("camera");
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    resetSectionConfig("permanentArrow");
    resetSectionConfig("camera");
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("applySectionConfig", () => {
    it("mutates the live config object in-place when payload is valid", () => {
      const ok = applySectionConfig("permanentArrow", {
        pulseDuration: 2500,
        scaleEpsilon: 0.02,
      });

      expect(ok).toBe(true);
      expect(permanentArrowUIConfig.pulseDuration).toBe(2500);
      expect(permanentArrowUIConfig.scaleEpsilon).toBe(0.02);
    });

    it("returns false and leaves live config unchanged on invalid Zod payload", () => {
      const ok = applySectionConfig("permanentArrow", {
        pulseDuration: "invalid-number",
      });

      expect(ok).toBe(false);
      expect(permanentArrowUIConfig.pulseDuration).toBe(defaultPulseDuration);
    });

    it("returns false for an unknown section ID", () => {
      const ok = applySectionConfig("nonExistentSection", { foo: 123 });
      expect(ok).toBe(false);
    });
  });

  describe("resetSectionConfig", () => {
    it("restores a mutated section back to its initial TypeScript defaults", () => {
      applySectionConfig("permanentArrow", { pulseDuration: 9999 });
      expect(permanentArrowUIConfig.pulseDuration).toBe(9999);

      resetSectionConfig("permanentArrow");
      expect(permanentArrowUIConfig.pulseDuration).toBe(defaultPulseDuration);
      expect(permanentArrowUIConfig.scaleEpsilon).toBe(defaultScaleEpsilon);
    });

    it("does nothing when given an unknown section ID", () => {
      expect(() => resetSectionConfig("unknownSection")).not.toThrow();
    });
  });

  describe("loadConfigsFromServer", () => {
    it("fetches /api/configs and applies valid sections in-place", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            permanentArrow: { pulseDuration: 1800 },
            camera: { minZoom: 0.42 },
          }),
        }),
      );

      await loadConfigsFromServer();

      expect(fetch).toHaveBeenCalledWith("/api/configs");
      expect(permanentArrowUIConfig.pulseDuration).toBe(1800);
      expect(cameraConfig.minZoom).toBe(0.42);
    });

    it("keeps defaults and logs a warning when server responds with non-OK status", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
        }),
      );

      await loadConfigsFromServer();

      expect(permanentArrowUIConfig.pulseDuration).toBe(defaultPulseDuration);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("Failed to fetch configs (500)"),
      );
    });

    it("keeps defaults and logs a warning when fetch throws a network error", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockRejectedValue(new Error("Network offline")),
      );

      await loadConfigsFromServer();

      expect(permanentArrowUIConfig.pulseDuration).toBe(defaultPulseDuration);
      expect( cameraConfig.minZoom).toBe(defaultMinZoom);
      expect(console.warn).toHaveBeenCalledWith(
        "Could not load configs from server, using defaults:",
        expect.any(Error),
      );
    });
  });
});
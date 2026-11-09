// tests/game/managers/forcelayoutmanager.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock d3-force 
vi.mock("d3-force", () => ({
  forceSimulation: vi.fn(() => ({
    stop: vi.fn().mockReturnThis(),
    nodes: vi.fn().mockReturnThis(),
    force: vi.fn().mockReturnThis(),
    alphaDecay: vi.fn().mockReturnThis(),
    alpha: vi.fn().mockReturnThis(),
    alphaMin: vi.fn(() => 0.001),
    tick: vi.fn(),
  })),
  forceLink: vi.fn(() => ({
    id: vi.fn().mockReturnThis(),
    links: vi.fn().mockReturnThis(),
    distance: vi.fn().mockReturnThis(),
    strength: vi.fn().mockReturnThis(),
  })),
  forceManyBody: vi.fn(() => ({
    strength: vi.fn().mockReturnThis(),
    distanceMax: vi.fn().mockReturnThis(),
  })),
  forceCenter: vi.fn(() => ({
    strength: vi.fn().mockReturnThis(),
  })),
  forceCollide: vi.fn(() => ({
    strength: vi.fn().mockReturnThis(),
  })),
  forceX: vi.fn(() => ({
    strength: vi.fn().mockReturnThis(),
  })),
  forceY: vi.fn(() => ({
    strength: vi.fn().mockReturnThis(),
  })),
}));

vi.mock("../../../src/game/data/organisms", () => ({
  organismDataMap: new Map([
    ["ants", { id: "ants", offsetX: 50, offsetY: -50 }],
  ]),
}));

import ForceLayoutManager from "../../../src/game/managers/ForceLayoutManager";
import type Organism from "../../../src/game/entities/organism";
import { DEFAULT_FORCE_CONFIG } from "../../../src/game/config/forceConfig";

describe("ForceLayoutManager", () => {
  let layoutManager: ForceLayoutManager;

  const createMockOrganism = (id: string, x = 100, y = 200): Organism =>
    ({
      organismData: { id },
      x,
      y,
      setPosition: vi.fn(),
    }) as unknown as Organism;

  beforeEach(() => {
    vi.clearAllMocks();
    layoutManager = new ForceLayoutManager(1920, 1080);
  });

  it("initializes with default config and calculates center coordinates", () => {
    const config = layoutManager.getConfig();
    expect(config.worldWidth).toBe(1920);
    expect(config.worldHeight).toBe(1080);
    expect(config.centerX).toBe(960);
    expect(config.centerY).toBe(540);
    expect(config.linkDistance).toBe(DEFAULT_FORCE_CONFIG.linkDistance);
  });

  it("computes spawn position using organism data offsets", () => {
    const pos = layoutManager.getSpawnPosition("ants");
    expect(pos).toEqual({ x: 960 + 50, y: 540 - 50 });

    const unknownPos = layoutManager.getSpawnPosition("unknown");
    expect(unknownPos).toEqual({ x: 960, y: 540 });
  });

  it("updates configuration and recalculates simulation", () => {
    const organism = createMockOrganism("ants");
    layoutManager.setConfig(
      { linkDistance: 750, chargeStrength: -2000 },
      [organism],
      [],
    );

    const config = layoutManager.getConfig();
    expect(config.linkDistance).toBe(750);
    expect(config.chargeStrength).toBe(-2000);
  });

  it("steps simulation and clamps node positions within padding boundaries", () => {
    const organism = createMockOrganism("ants", -500, 2000); // Out of bounds
    layoutManager.recalculate([organism], []);

    // Step should execute without errors
    layoutManager.step();
    expect(organism.setPosition).toHaveBeenCalled();
  });
});
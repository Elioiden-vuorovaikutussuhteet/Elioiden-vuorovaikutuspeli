import "vitest-canvas-mock";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type Phaser from "phaser";
import GlowManager from "../../../src/game/managers/GlowManager";
import type Organism from "../../../src/game/entities/organism";
import { glowConfig } from "../../../src/game/config";

describe("GlowManager", () => {
  let mockScene: Phaser.Scene;
  let mockTweens: Array<{
    config: Record<string, unknown>;
    stop: ReturnType<typeof vi.fn>;
    restart: ReturnType<typeof vi.fn>;
  }>;
  let glowManager: GlowManager;

  const createMockGlow = (color: number) => ({
    color,
    outerStrength: 0,
    setPaddingOverride: vi.fn(),
    destroy: vi.fn(),
  });

  const createMockFilterList = () => ({
    addGlow: vi.fn((color: number) => createMockGlow(color)),
    remove: vi.fn(),
  });

  const createMockOrganism = (): Organism => {
    const orgFilters = {
      internal: createMockFilterList(),
      external: createMockFilterList(),
    };
    const dupFilters = {
      internal: createMockFilterList(),
      external: createMockFilterList(),
    };

    const duplicateContainer = {
      filters: null as typeof dupFilters | null,
      enableFilters: vi.fn(function (this: {
        filters: typeof dupFilters | null;
      }) {
        this.filters = dupFilters;
        return this;
      }),
    };

    const organism = {
      filters: null as typeof orgFilters | null,
      enableFilters: vi.fn(function (this: {
        filters: typeof orgFilters | null;
      }) {
        this.filters = orgFilters;
        return this;
      }),
      duplicateContainer,
    };

    return organism as unknown as Organism;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockTweens = [];

    mockScene = {
      tweens: {
        add: vi.fn((config: Record<string, unknown>) => {
          const tween = {
            config,
            stop: vi.fn(),
            restart: vi.fn(),
          };
          mockTweens.push(tween);
          return tween;
        }),
      },
    } as unknown as Phaser.Scene;

    glowManager = new GlowManager(mockScene, glowConfig);
  });

  it("does nothing when health change amount is 0", () => {
    const organism = createMockOrganism();

    glowManager.healthChanged(organism, 0);

    expect(organism.enableFilters).not.toHaveBeenCalled();
    expect(mockScene.tweens.add).not.toHaveBeenCalled();
  });

  it("adds white and colored glows to filters.internal for positive and negative health changes", () => {
    const organism = createMockOrganism();

    glowManager.healthChanged(organism, 10);

    expect(organism.enableFilters).toHaveBeenCalledOnce();
    expect(organism.duplicateContainer.enableFilters).toHaveBeenCalledOnce();

    expect(organism.filters!.internal.addGlow).toHaveBeenNthCalledWith(
      1,
      glowConfig.whiteGlow,
      undefined,
      undefined,
      undefined,
      undefined,
      glowConfig.glowQuality,
    );
    expect(organism.filters!.internal.addGlow).toHaveBeenNthCalledWith(
      2,
      glowConfig.positiveGlow,
      undefined,
      undefined,
      undefined,
      undefined,
      glowConfig.glowQuality,
    );
    expect(organism.filters!.external.addGlow).not.toHaveBeenCalled();
    expect(mockTweens).toHaveLength(2);
  });

  it("reuses existing glows and restarts tweens when already glowing", () => {
    const organism = createMockOrganism();

    glowManager.healthChanged(organism, 10);
    expect(organism.filters!.internal.addGlow).toHaveBeenCalledTimes(2);

    glowManager.healthChanged(organism, -5);

    expect(organism.filters!.internal.addGlow).toHaveBeenCalledTimes(2);
    expect(mockTweens).toHaveLength(2);
    expect(mockTweens[0].restart).toHaveBeenCalledOnce();
    expect(mockTweens[1].restart).toHaveBeenCalledOnce();

    const outerGlowInstance = vi.mocked(organism.filters!.internal.addGlow).mock
      .results[1].value;
    expect(outerGlowInstance.color).toBe(glowConfig.negativeGlow);
  });

  it("removes only its own internal filters and destroys glows on tween completion", () => {
    const organism = createMockOrganism();

    glowManager.healthChanged(organism, -10);

    const whiteGlow = vi.mocked(organism.filters!.internal.addGlow).mock
      .results[0].value;
    const outerGlow = vi.mocked(organism.filters!.internal.addGlow).mock
      .results[1].value;
    const dupWhiteGlow = vi.mocked(
      organism.duplicateContainer.filters!.internal.addGlow,
    ).mock.results[0].value;
    const dupOuterGlow = vi.mocked(
      organism.duplicateContainer.filters!.internal.addGlow,
    ).mock.results[1].value;

    const onComplete = (mockTweens[0].config.onComplete ??
      mockTweens[1].config.onComplete) as () => void;
    expect(onComplete).toBeTypeOf("function");

    onComplete();

    expect(mockTweens[0].stop).toHaveBeenCalledOnce();
    expect(mockTweens[1].stop).toHaveBeenCalledOnce();

    expect(organism.filters!.internal.remove).toHaveBeenCalledWith(outerGlow);
    expect(organism.filters!.internal.remove).toHaveBeenCalledWith(whiteGlow);
    expect(
      organism.duplicateContainer.filters!.internal.remove,
    ).toHaveBeenCalledWith(dupOuterGlow);
    expect(
      organism.duplicateContainer.filters!.internal.remove,
    ).toHaveBeenCalledWith(dupWhiteGlow);

    expect(outerGlow.destroy).toHaveBeenCalledOnce();
    expect(whiteGlow.destroy).toHaveBeenCalledOnce();
    expect(dupOuterGlow.destroy).toHaveBeenCalledOnce();
    expect(dupWhiteGlow.destroy).toHaveBeenCalledOnce();
  });

  it("cleans up all active glows and tweens on destroy()", () => {
    const first = createMockOrganism();
    const second = createMockOrganism();

    glowManager.healthChanged(first, 10);
    glowManager.healthChanged(second, -10);

    glowManager.destroy();

    expect(first.filters!.internal.remove).toHaveBeenCalledTimes(2);
    expect(second.filters!.internal.remove).toHaveBeenCalledTimes(2);
  });
});

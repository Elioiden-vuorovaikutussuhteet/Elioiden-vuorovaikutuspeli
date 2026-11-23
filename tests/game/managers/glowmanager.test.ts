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

    glowManager.healthChanged(organism, 0, 100);

    expect(organism.enableFilters).not.toHaveBeenCalled();
    expect(mockScene.tweens.add).not.toHaveBeenCalled();
  });

  it("adds overall and colored pulse glows to internal filters", () => {
    const organism = createMockOrganism();

    glowManager.healthChanged(organism, 10, 100);

    expect(organism.enableFilters).toHaveBeenCalledOnce();
    expect(organism.duplicateContainer.enableFilters).toHaveBeenCalledOnce();

    expect(organism.filters!.internal.addGlow).toHaveBeenCalledTimes(3);
    expect(
      organism.duplicateContainer.filters!.internal.addGlow,
    ).toHaveBeenCalledTimes(3);

    expect(organism.filters!.internal.addGlow).toHaveBeenNthCalledWith(
      1,
      glowConfig.whiteGlow,
      0,
      undefined,
      undefined,
      undefined,
      glowConfig.glowQuality,
    );

    expect(organism.filters!.internal.addGlow).toHaveBeenNthCalledWith(
      2,
      glowConfig.whiteGlow,
      0,
      undefined,
      undefined,
      undefined,
      glowConfig.glowQuality,
    );

    expect(organism.filters!.internal.addGlow).toHaveBeenNthCalledWith(
      3,
      glowConfig.positiveGlow,
      0,
      undefined,
      undefined,
      undefined,
      glowConfig.glowQuality,
    );

    expect(organism.filters!.external.addGlow).not.toHaveBeenCalled();
  });

  it("reuses overall glows and restarts the pulse when already glowing", () => {
    const organism = createMockOrganism();

    glowManager.healthChanged(organism, 10, 100);

    expect(organism.filters!.internal.addGlow).toHaveBeenCalledTimes(3);

    glowManager.healthChanged(organism, -5, 100);

    expect(organism.filters!.internal.addGlow).toHaveBeenCalledTimes(3);

    expect(mockTweens).toHaveLength(6);

    expect(mockTweens[0].stop).toHaveBeenCalledOnce();
    expect(mockTweens[1].stop).toHaveBeenCalledOnce();

    expect(mockTweens[2].stop).toHaveBeenCalledOnce();

    expect(mockTweens[3].stop).not.toHaveBeenCalled();
    expect(mockTweens[4].stop).not.toHaveBeenCalled();
    expect(mockTweens[5].stop).not.toHaveBeenCalled();

    const pulseGlow = vi.mocked(organism.filters!.internal.addGlow).mock
      .results[2].value;

    expect(pulseGlow.color).toBe(glowConfig.negativeGlow);
  });

  it("removes pulse glows on tween completion", () => {
    const organism = createMockOrganism();

    glowManager.healthChanged(organism, -10, 100);

    const pulseGlow = vi.mocked(organism.filters!.internal.addGlow).mock
      .results[2].value;

    const duplicatePulseGlow = vi.mocked(
      organism.duplicateContainer.filters!.internal.addGlow,
    ).mock.results[2].value;

    const pulseTween = mockTweens[2];

    const onComplete = pulseTween.config.onComplete as () => void;

    expect(onComplete).toBeTypeOf("function");

    onComplete();

    expect(pulseTween.stop).toHaveBeenCalledOnce();

    expect(organism.filters!.internal.remove).toHaveBeenCalledWith(pulseGlow);

    expect(
      organism.duplicateContainer.filters!.internal.remove,
    ).toHaveBeenCalledWith(duplicatePulseGlow);

    expect(pulseGlow.destroy).toHaveBeenCalledOnce();
    expect(duplicatePulseGlow.destroy).toHaveBeenCalledOnce();

    expect(organism.filters!.internal.remove).toHaveBeenCalledTimes(1);
  });

  it("cleans up all active glows and tweens on destroy()", () => {
    const first = createMockOrganism();
    const second = createMockOrganism();

    glowManager.healthChanged(first, 10, 100);
    glowManager.healthChanged(second, -10, 100);

    glowManager.destroy();

    expect(first.filters!.internal.remove).toHaveBeenCalledTimes(3);
    expect(second.filters!.internal.remove).toHaveBeenCalledTimes(3);

    expect(
      first.duplicateContainer.filters!.internal.remove,
    ).toHaveBeenCalledTimes(3);

    expect(
      second.duplicateContainer.filters!.internal.remove,
    ).toHaveBeenCalledTimes(3);

    expect(glowManager["states"].size).toBe(0);
  });
});

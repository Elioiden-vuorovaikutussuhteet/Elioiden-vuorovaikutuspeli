import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RandomEventManager from "../../../src/game/managers/RandomEventManager";
import type Organism from "../../../src/game/entities/organism";
import type ArrowManager from "../../../src/game/managers/ArrowManager";

describe("RandomEventManager", () => {
  let timerCallback: (() => void) | undefined;
  let scene: {
    time: {
      addEvent: (config: { callback: () => void }) => unknown;
      remove: () => void;
    };
  };

  beforeEach(() => {
    vi.useFakeTimers();
    timerCallback = undefined;
    scene = {
      time: {
        addEvent: vi.fn((config: { callback: () => void }) => {
          timerCallback = config.callback;
          return { remove: vi.fn() };
        }),
        remove: vi.fn(),
      },
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not trigger events when configured chance is zero", () => {
    const manager = new RandomEventManager();
    const arrowManager = {
      playRandomEventPulses: vi.fn(),
    } as unknown as ArrowManager;

    manager.startRandomEvents(
      scene as never,
      [],
      arrowManager,
      1000,
      0,
    );
    vi.advanceTimersByTime(1000);

    expect(arrowManager.playRandomEventPulses).not.toHaveBeenCalled();
  });

  it("attempts an event when configured chance is one", () => {
    const manager = new RandomEventManager();
    const target = {
      organismData: { id: "amf" },
    } as Organism;
    const arrowManager = {
      playRandomEventPulses: vi.fn(),
    } as unknown as ArrowManager;
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.9);

    manager.startRandomEvents(
      scene as never,
      [target],
      arrowManager,
      1000,
      1,
    );
    vi.advanceTimersByTime(1000);

    expect(arrowManager.playRandomEventPulses).toHaveBeenCalled();
    randomSpy.mockRestore();
  });

  it("allows Lightning Strike only once per game", () => {
    const manager = new RandomEventManager();
    const target = {
      organismData: { id: "sapota" },
    } as Organism;
    const arrowManager = {
      playRandomEventPulses: vi.fn(),
    } as unknown as ArrowManager;
    const removeOrganism = vi.fn();
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    manager.triggerRandomEvent([target], arrowManager, removeOrganism);
    manager.triggerRandomEvent([target], arrowManager, removeOrganism);

    expect(removeOrganism).toHaveBeenCalledTimes(1);
    expect(removeOrganism).toHaveBeenCalledWith(target);
    randomSpy.mockRestore();
  });

  it("defers Lightning Strike removal until the backend-effect callback", () => {
    const manager = new RandomEventManager();
    const target = {
      organismData: { id: "sapota" },
    } as Organism;
    const arrowManager = {
      playRandomEventPulses: vi.fn(),
    } as unknown as ArrowManager;
    const removeOrganism = vi.fn();
    let applyLightningEffect: (() => void) | undefined;
    const playLightningAnimation = vi.fn(
      (lightningEffects: () => void) => {
        applyLightningEffect = lightningEffects;
      },
    );
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    manager.triggerRandomEvent(
      [target],
      arrowManager,
      removeOrganism,
      playLightningAnimation,
    );

    expect(playLightningAnimation).toHaveBeenCalledOnce();
    expect(removeOrganism).not.toHaveBeenCalled();

    applyLightningEffect?.();

    expect(removeOrganism).toHaveBeenCalledOnce();
    expect(removeOrganism).toHaveBeenCalledWith(target);
    randomSpy.mockRestore();
  });

  it("removes exactly one tree during Lightning Strike", () => {
    const manager = new RandomEventManager();
    const acacia = {
      organismData: { id: "acacia" },
    } as Organism;
    const sapota = {
      organismData: { id: "sapota" },
    } as Organism;
    const arrowManager = {
      playRandomEventPulses: vi.fn(),
    } as unknown as ArrowManager;
    const removeOrganism = vi.fn();
    let lightningEffect: (() => void) | undefined;
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    manager.triggerRandomEvent(
      [acacia, sapota],
      arrowManager,
      removeOrganism,
      (effect) => {
        lightningEffect = effect;
      },
    );

    lightningEffect?.();

    expect(removeOrganism).toHaveBeenCalledOnce();
    expect(removeOrganism).toHaveBeenCalledWith(acacia);
    randomSpy.mockRestore();
  });

  it("stops after four random events in a playthrough", () => {
    const manager = new RandomEventManager();
    const target = {
      organismData: { id: "amf" },
    } as Organism;
    const arrowManager = {
      playRandomEventPulses: vi.fn(),
    } as unknown as ArrowManager;
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.9);

    manager.startRandomEvents(
      scene as never,
      [target],
      arrowManager,
      1000,
      1,
      4,
    );

    for (let i = 0; i < 6; i++) {
      vi.advanceTimersByTime(1000);
    }

    expect(arrowManager.playRandomEventPulses).toHaveBeenCalledTimes(4);
    randomSpy.mockRestore();
  });
});

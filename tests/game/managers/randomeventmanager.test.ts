import { beforeEach, describe, expect, it, vi } from "vitest";
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
    timerCallback?.();

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
    timerCallback?.();

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
      timerCallback?.();
    }

    expect(arrowManager.playRandomEventPulses).toHaveBeenCalledTimes(4);
    randomSpy.mockRestore();
  });
});

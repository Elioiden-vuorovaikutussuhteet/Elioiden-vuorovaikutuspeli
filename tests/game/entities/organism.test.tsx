import "vitest-canvas-mock";
import {describe, expect, it, vi } from "vitest";
import Organism, { getOrganismData } from "../../../src/game/entities/organism";

describe("getOrganismData", () => {
  it("throws error when the organism type does not exist", () => {
    expect(() => getOrganismData("does-not-exist")).toThrow(
      'Organism type "does-not-exist" not found'
    );
  });

  it("returns the correct data for a valid organism type", () => {
    const data = getOrganismData("acacia");

    expect(data.id).toBe("acacia");
    expect(data.name).toBe("Bullhorn Acacia");
  });
});

describe("Organism", () => {
  function createOrganismStub() {
    // Create an Organism without calling its constructor
    const organism = Object.create(Organism.prototype) as Organism;

    const nameText = {
      setPosition: vi.fn(),
      destroy: vi.fn(),
    };

    const duplicateContainer = {
      setPosition: vi.fn(),
      destroy: vi.fn(),
    };

    Object.assign(organism, {
      x: 200,
      y: 300,
      z: 0,
      w: 0,
      nameText,
      duplicateContainer,
      ignoreDestroy: true,
    });

    // Avoid relying on Phaser displayHeight calculation
    Object.defineProperty(organism, "displayHeight", {
      configurable: true,
      value: 100,
    });

    return { organism, nameText, duplicateContainer };
  }

  it("updates nameText and duplicateContainer positions when setPosition is called", () => {
    const { organism, nameText, duplicateContainer } = createOrganismStub();

    organism.setPosition(450, 600);

    expect(organism.x).toBe(450);
    expect(organism.y).toBe(600);

    expect(duplicateContainer.setPosition).toHaveBeenCalledWith(450, 600);

    expect(nameText.setPosition).toHaveBeenCalledWith(450, 600 + organism.displayHeight / 2 + 20);
  });

  it("destroys nameText and duplicateContainer when destroyed", () => {
    const { organism, nameText, duplicateContainer } = createOrganismStub();

    organism.destroy(true);

    expect(duplicateContainer.destroy).toHaveBeenCalledWith(true);
    expect(nameText.destroy).toHaveBeenCalledWith(true);
  });
});
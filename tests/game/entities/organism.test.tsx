import "vitest-canvas-mock";
import { describe, expect, it, vi } from "vitest";
import Organism from "../../../src/game/entities/organism";

describe("Organism", () => {
    it("throws error when the organism type does not exist", () => {
        const scene = {
            add: {
                existing: vi.fn(),
            },
        } as any;

        expect(() => {
            new Organism(scene, 100, 200, "does-not-exist");
        }).toThrow('Organism type "does-not-exist" not found');
    });
});

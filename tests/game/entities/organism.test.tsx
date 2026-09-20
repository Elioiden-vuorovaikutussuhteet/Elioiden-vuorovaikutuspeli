import "vitest-canvas-mock";
import { describe, expect, it, vi } from "vitest";
import { getOrganismData } from "../../../src/game/entities/organism";

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
        expect(data.default_scale).toBe(1.5)
    });
});

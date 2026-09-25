import "vitest-canvas-mock";
import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PhaserGame } from "../../src/components/PhaserGame";
import { createGame } from "../../src/game/Game";

const mockDestroy = vi.fn();

vi.mock("../../src/game/Game", () => ({
    createGame: vi.fn(() => ({
        destroy: mockDestroy,
    })),
}));

describe("PhaserGame", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("creates the game with the container element", () => {
        const { container } = render(<PhaserGame />);
    
        expect(createGame).toHaveBeenCalledOnce();
        expect(createGame).toHaveBeenCalledWith(container.firstElementChild);
    });

    it("destroys the game when unmounted", () => {
        const { unmount } = render(<PhaserGame />);
        unmount();
    
        expect(mockDestroy).toHaveBeenCalledOnce();
        expect(mockDestroy).toHaveBeenCalledWith(true);
    });
});
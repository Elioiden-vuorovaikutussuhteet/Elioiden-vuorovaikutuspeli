import "vitest-canvas-mock";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GameScene from "../../../src/game/scenes/GameScene";
import Organism from "../../../src/game/entities/organism";

vi.mock("../../../src/game/entities/organism", () => ({
    default: vi.fn(),
}));

const mockPartial = <T,>(value: Partial<T>): T => value as T;


describe("GameScene", () => {
    let scene: GameScene;

    beforeEach(() => {
        scene = new GameScene();

        scene.cameras = mockPartial<typeof scene.cameras>({
            main: {
                centerX: 500,
                centerY: 500,
            },
        });

        scene.scene = mockPartial<typeof scene.scene>({
            launch: vi.fn(),
        });

        scene.events = mockPartial<typeof scene.events>({
            once: vi.fn(),
        });

        scene.time = mockPartial<typeof scene.time>({
            delayedCall: vi.fn(),
        });
    });

    it("loads the game assets", () => {
        const scene = new GameScene();

        scene.load = mockPartial<typeof scene.load>({
            setPath: vi.fn(),
            image: vi.fn(),
        });

        scene.preload();

        expect(scene.load.setPath).toHaveBeenCalledWith("assets");

        expect(scene.load.image).toHaveBeenCalledWith(
            "acacia_sprite",
            "bullhornacacia.png"
        );

        expect(scene.load.image).toHaveBeenCalledWith(
            "amf_sprite",
            "amf.png"
        );
    });

    it("launches the menu and creates an acacia", () => {
        scene.create();

        expect(scene.scene.launch).toHaveBeenCalledWith("MenuScene");

        expect(Organism).toHaveBeenCalledWith(
            scene,
            500,
            300,
            "acacia"
        );
    });

    it("creates an amf 3s after the menu closes", () => {
        scene.create();

        const menuClosedCallback =
            vi.mocked(scene.events.once).mock.calls[0][1];

        menuClosedCallback();

        expect(scene.time.delayedCall).toHaveBeenCalledWith(
            3000,
            expect.any(Function)
        );

        const delayedCallback =
            vi.mocked(scene.time.delayedCall).mock.calls[0][1];

        delayedCallback();

        expect(Organism).toHaveBeenCalledWith(
            scene,
            500,
            700,
            "amf"
        );
    });
});

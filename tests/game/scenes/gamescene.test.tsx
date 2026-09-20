import "vitest-canvas-mock";
import { describe, expect, it, vi, beforeEach } from "vitest";
import GameScene from "../../../src/game/scenes/GameScene";
import Organism from "../../../src/game/entities/organism";

vi.mock("../../../src/game/entities/organism", () => ({
    default: vi.fn()
}));

describe("GameScene", () => {
    let scene: GameScene;

    beforeEach(() => {
        scene = new GameScene();

        scene.cameras = {
            main: {
                centerX: 500,
                centerY: 500,
            },
        } as any;

        scene.scene = {
            launch: vi.fn(),
        } as any;

        scene.events = {
            once: vi.fn(),
        } as any;

        scene.time = {
            delayedCall: vi.fn(),
        } as any;
    });

    it("loads the game assets", () => {
        const scene = new GameScene();

        scene.load = {
            setPath: vi.fn(),
            image: vi.fn(),
        } as any;

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
            500,
            "acacia"
        );
      });
  
    it("creates an amf after the menu closes", () => {
        scene.create();

        const menuClosedCallback = vi.mocked(scene.events.once).mock.calls[0][1];

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
            600,
            850,
            "amf"
        );
    });
});


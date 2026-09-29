import "vitest-canvas-mock";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GameScene from "../../../src/game/scenes/GameScene";
import Organism from "../../../src/game/entities/organism";

const { MockOrganism, mockOrganismOn } = vi.hoisted(() => {
    const mockOrganismOn = vi.fn();

    const MockOrganism = vi.fn(function (
        _scene: GameScene,
        x: number,
        y: number,
        type = "acacia"
    ) {
        return {
            organismData: {
                id: type,
                name: type,
                texture: `${type}_sprite`,
                default_scale: 1,
            },
            x,
            y,
            on: mockOrganismOn,
        };
    });

    return { MockOrganism, mockOrganismOn };
});


vi.mock("../../../src/game/entities/organism", () => ({
    default: MockOrganism,
}));

const mockPartial = <T,>(value: Partial<T>): T => value as T;

describe("GameScene", () => {
    let scene: GameScene;

    beforeEach(() => {
        vi.clearAllMocks();

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

    it("logs to console after 2 organisms are selected", () => {
        // edit this test once arrow making function is called instead of log
        const consoleLogSpy = vi
            .spyOn(console, "log")
            .mockImplementation(() => {});
    
        scene.create();
    
        const menuClosedCallback =
            vi.mocked(scene.events.once).mock.calls[0][1];
    
        menuClosedCallback();
    
        const delayedCallback =
            vi.mocked(scene.time.delayedCall).mock.calls[0][1];
    
        delayedCallback();
    
        const firstOrganism =
            vi.mocked(Organism).mock.results[0].value;
    
        const secondOrganism =
            vi.mocked(Organism).mock.results[1].value;
    
        const firstSelectionCallback =
            mockOrganismOn.mock.calls[0][1];
    
        const secondSelectionCallback =
            mockOrganismOn.mock.calls[1][1];
    
        firstSelectionCallback.call(scene, firstOrganism);
        secondSelectionCallback.call(scene, secondOrganism);

        expect(consoleLogSpy).toHaveBeenNthCalledWith(
            1,
            "acacia",
            500,
            300,
            1
        );
    
        expect(consoleLogSpy).toHaveBeenNthCalledWith(
            2,
            "amf",
            500,
            700,
            1
        );
    
        consoleLogSpy.mockRestore();
    });
    
    it("does nothing when the same organism is selected twice", () => {
    const consoleLogSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});

    scene.create();

    const menuClosedCallback =
        vi.mocked(scene.events.once).mock.calls[0][1];

    menuClosedCallback();

    const delayedCallback =
        vi.mocked(scene.time.delayedCall).mock.calls[0][1];

    delayedCallback();

    const organism =
        vi.mocked(Organism).mock.results[0].value;

    const selectionCallback =
        mockOrganismOn.mock.calls[0][1];

    selectionCallback.call(scene, organism);
    selectionCallback.call(scene, organism);

    expect(consoleLogSpy).not.toHaveBeenCalled();

    consoleLogSpy.mockRestore();
});

});

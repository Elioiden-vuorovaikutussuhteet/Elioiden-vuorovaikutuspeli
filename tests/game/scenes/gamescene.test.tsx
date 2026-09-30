import "vitest-canvas-mock";
import { mockDeep } from 'vitest-mock-extended';
import { beforeEach, describe, expect, it, vi } from "vitest";
import GameScene from "../../../src/game/scenes/GameScene";
import Organism from "../../../src/game/entities/organism";
import InfoButton from "../../../src/game/entities/infobutton";

const { MockOrganism, mockOrganismOn, MockInfoButton, mockInfoButtonOn } =
vi.hoisted(() => {
    const mockOrganismOn = vi.fn();
    const mockInfoButtonOn = vi.fn();

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
    
    const MockInfoButton = vi.fn(function (
        //_scene: GameScene,
        //_x: number,
        //_y: number
    ) {
        return {
            on: mockInfoButtonOn,
        };
    });

    return {
        MockOrganism,
        mockOrganismOn,
        MockInfoButton,
        mockInfoButtonOn,
    };
});

vi.mock("../../../src/game/entities/organism", () => ({
    default: MockOrganism,
}));

vi.mock("../../../src/game/entities/infobutton", () => ({
    default: MockInfoButton,
}));


const mockPartial = <T,>(value: Partial<T>): T => value as T;

describe("GameScene", () => {
    let scene: GameScene;

    beforeEach(() => {
        vi.clearAllMocks();

        scene = new GameScene();

        scene.cameras = mockDeep<typeof scene.cameras>({
            main: {
                centerX: 500,
                centerY: 500,
            },
            add: vi.fn().mockReturnValue({
                setScroll: vi.fn(),
                setZoom: vi.fn(),
                ignore: vi.fn(),
            }),
        });

        scene.input = mockDeep<typeof scene.input>({
            keyboard: {
                createCursorKeys: vi.fn().mockReturnValue({}),
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
            .mockImplementation(() => { });

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
            .mockImplementation(() => { });

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

    it("launches the tutorial scene when the info button is clicked", () => {
        scene.create();

        expect(InfoButton).toHaveBeenCalledWith(scene, 40, 40);

        const infoButtonCallback =
            vi.mocked(mockInfoButtonOn).mock.calls[0][1];

        infoButtonCallback();

        expect(scene.scene.launch).toHaveBeenCalledWith("TutorialScene");
    });
});

describe("GameScene Camera System", () => {
    let scene: GameScene;
    let mockCursors: {
        left: { isDown: boolean };
        right: { isDown: boolean };
        up: { isDown: boolean };
        down: { isDown: boolean };
    };

    beforeEach(() => {
        vi.clearAllMocks();

        scene = new GameScene();

        const uiCamera = {
            setScroll: vi.fn(),
            setZoom: vi.fn(),
            ignore: vi.fn(),
        };

        scene.cameras = mockDeep<typeof scene.cameras>({
            main: {
                centerX: 500,
                centerY: 500,
                width: 1920,
                height: 1080,
            },
            add: vi.fn().mockReturnValue({
                setScroll: vi.fn(),
                setZoom: vi.fn(),
                ignore: vi.fn(),
            }),
        });
                
        scene.input = mockDeep<typeof scene.input>();
        scene.add = mockDeep<typeof scene.add>();

        scene.cameras.main.width = 1920;
        scene.cameras.main.height = 1080;
        scene.cameras.main.scrollX = 0;
        scene.cameras.main.scrollY = 0;
        scene.cameras.main.zoom = 1;

        mockCursors = {
            left: { isDown: false },
            right: { isDown: false },
            up: { isDown: false },
            down: { isDown: false },
        };

        scene.input.keyboard!.createCursorKeys = vi.fn().mockReturnValue(mockCursors);

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

    describe('create()', () => {
        it('configures bounds to 1 screen left and 3 screens wide', () => {
            scene.create();

            expect(scene.cameras.main.setBounds).toHaveBeenCalledWith(-1920, -1080, 5760, 3240);
            expect(scene.cameras.main.scrollX).toBe(0);
        });

        it('registers a wheel event listener on input', () => {
            scene.create();

            expect(scene.input.on).toHaveBeenCalledWith(
                'wheel',
                expect.any(Function)
            );
        });
    });

    describe('update()', () => {
        it('scrolls camera up when up arrow is pressed', () => {
            scene.create();

            mockCursors.up.isDown = true;
            scene.cameras.main.scrollY = 0;

            scene.update();

            expect(scene.cameras.main.scrollY).toBeLessThan(0);
        });

        it('scrolls camera down when down arrow is pressed', () => {
            scene.create();

            mockCursors.down.isDown = true;
            scene.cameras.main.scrollY = 0;

            scene.update();

            expect(scene.cameras.main.scrollY).toBeGreaterThan(0);
        });

        it('scrolls camera left when left arrow is pressed', () => {
            scene.create();

            mockCursors.left.isDown = true;
            scene.cameras.main.scrollX = 0;

            scene.update();

            expect(scene.cameras.main.scrollX).toBeLessThan(0);
        });

        it('scrolls camera right when right arrow is pressed', () => {
            scene.create();

            mockCursors.right.isDown = true;
            scene.cameras.main.scrollY = 0;

            scene.update();

            expect(scene.cameras.main.scrollX).toBeGreaterThan(0);
        });
    });
});
import "vitest-canvas-mock";
import { mockDeep } from "vitest-mock-extended";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GameScene from "../../../src/game/scenes/GameScene";
import Organism from "../../../src/game/entities/organism";
import InfoButton from "../../../src/game/entities/infobutton";

const {
  MockOrganism,
  MockInfoButton,
  mockInfoButtonOn,
  mockArrowButtonsOn,
  MockArrowButtons,
} = vi.hoisted(() => {
  const mockOrganismOn = vi.fn();
  const mockInfoButtonOn = vi.fn()
  const mockArrowButtonsOn = vi.fn();

  const MockOrganism = vi.fn(function (
    _scene: GameScene,
    x: number,
    y: number,
    type = "acacia",
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
      HP: 100,
      nameText: {},
      on: mockOrganismOn,
      changeHealth: vi.fn(),
      changeScale: vi.fn(),
    };
  });

  const MockInfoButton = vi.fn(function () {
    //_scene: GameScene,
    //_x: number,
    //_y: number
    return {
      on: mockInfoButtonOn,
    };
  });

  const MockArrowButtons = vi.fn(function () {
    return {
      on: mockArrowButtonsOn,
    };
  });


  return {
    MockOrganism,
    mockOrganismOn,
    MockInfoButton,
    mockInfoButtonOn,
    MockArrowButtons,
    mockArrowButtonsOn,
  };
});

vi.mock("../../../src/game/entities/organism", () => ({
  default: MockOrganism,
}));

vi.mock("../../../src/game/entities/infobutton", () => ({
  default: MockInfoButton,
}));

vi.mock("../../../src/game/entities/arrowbuttons", () => ({
  default: MockArrowButtons,
}));

vi.mock("../../../src/game/RelationsService", () => ({
  getRelation: vi.fn(),
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
      pause: vi.fn(),
      bringToTop: vi.fn(),
      resume: vi.fn(),
    });

    scene.events = mockPartial<typeof scene.events>({
      once: vi.fn(),
    });

    scene.time = mockPartial<typeof scene.time>({
      delayedCall: vi.fn(),
    });
    scene.add = mockDeep<typeof scene.add>({
      graphics: vi.fn().mockReturnValue({
        setDepth: vi.fn(),
        clear: vi.fn(),
        lineStyle: vi.fn(),
        fillStyle: vi.fn(),
        lineBetween: vi.fn(),
        fillTriangle: vi.fn(),
      }),

      particles: vi.fn().mockReturnValue({
        setDepth: vi.fn(),
        setPosition: vi.fn(),
        explode: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        destroy: vi.fn(),
      }),
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
      "bullhornacacia.png",
    );

    expect(scene.load.image).toHaveBeenCalledWith("amf_sprite", "amf.png");
  });

  it("launches the menu and creates an acacia", () => {
    scene.create();

    expect(scene.scene.launch).toHaveBeenCalledWith("MenuScene");

    expect(Organism).toHaveBeenCalledWith(scene, 500, 300, "acacia", expect.anything(), expect.any(Function));
  });

  it("creates an amf 3s after the menu closes", () => {
    scene.create();

    const menuClosedCallback = vi.mocked(scene.events.once).mock.calls[0][1];

    menuClosedCallback();

    expect(scene.time.delayedCall).toHaveBeenCalledWith(
      3000,
      expect.any(Function),
    );

    const delayedCallback = vi.mocked(scene.time.delayedCall).mock.calls[0][1];

    delayedCallback();

    expect(Organism).toHaveBeenCalledWith(scene, 500, 700, "amf", expect.anything(), expect.any(Function));
  });


  it("launches the tutorial scene when the info button is clicked", () => {
    scene.create();

    expect(InfoButton).toHaveBeenCalledWith(scene, 40, 40);

    const infoButtonCallback = vi.mocked(mockInfoButtonOn).mock.calls[0][1];

    infoButtonCallback();

    expect(scene.scene.launch).toHaveBeenCalledWith("TutorialScene");
  });

  it('pauses properly on game start', () => {
    scene.create()
    expect(scene.scene.pause).toHaveBeenCalledTimes(1);
    expect(scene.scene.launch).toHaveBeenCalledWith('MenuScene');
  });

});

import "vitest-canvas-mock";
import { mockDeep } from "vitest-mock-extended";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GameScene from "../../../src/game/scenes/GameScene";
import Organism from "../../../src/game/entities/organism";
import InfoButton from "../../../src/game/entities/infobutton";
import HintButton from "../../../src/game/entities/hintbutton";
import { gameSceneConfig, type GameSceneConfig } from "../../../src/game/config";
import { organisms } from "../../../src/game/data/organisms";

const {
  MockOrganism,
  MockInfoButton,
  mockInfoButtonOn,
  MockHintButton,
  mockHintButtonOn,
  mockArrowButtonsOn,
  MockArrowButtons,
  MockCursorButton,
} = vi.hoisted(() => {
  const mockOrganismOn = vi.fn();
  const mockInfoButtonOn = vi.fn();
  const mockHintButtonOn = vi.fn();
  const mockArrowButtonsOn = vi.fn();
  const mockCursorButtonOn = vi.fn();

  const MockOrganism = vi.fn(function (
    _scene: GameScene,
    id = "acacia",
    x: number,
    y: number,
  ) {
    return {
      organismData: {
        id: id,
        name: id,
        texture: `${id}_sprite`,
        default_scale: 1,
      },
      x,
      y,
      HP: 100,
      nameText: {},
      on: mockOrganismOn,
      changeHealth: vi.fn(),
      changeScale: vi.fn(),
      highlight: vi.fn(),
    };
  });

  const MockInfoButton = vi.fn(function () {
    return {
      on: mockInfoButtonOn,
    };
  });

  const MockHintButton = vi.fn(function () {
    return {
      on: mockHintButtonOn,
    };
  });

  const MockArrowButtons = vi.fn(function () {
    return {
      on: mockArrowButtonsOn,
    };
  });

  const MockCursorButton = vi.fn(function () {
    return {
      on: mockCursorButtonOn,
    };
  });

  return {
    MockOrganism,
    mockOrganismOn,
    MockInfoButton,
    mockInfoButtonOn,
    MockHintButton,
    mockHintButtonOn,
    MockArrowButtons,
    mockArrowButtonsOn,
    MockCursorButton,
  };
});

vi.mock("../../../src/game/entities/organism", () => ({
  default: MockOrganism,
}));

vi.mock("../../../src/game/entities/infobutton", () => ({
  default: MockInfoButton,
}));

vi.mock("../../../src/game/entities/hintbutton", () => ({
  default: MockHintButton,
}));

vi.mock("../../../src/game/entities/arrowbuttons", () => ({
  default: MockArrowButtons,
}));

vi.mock("../../../src/game/entities/cursorbutton", () => ({
  default: MockCursorButton,
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

    scene.scale = {
      width: 800,
      height: 600,
    } as Phaser.Scale.ScaleManager;

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

      text: vi.fn().mockReturnValue({
        setText: vi.fn(),
        setOrigin: vi.fn(),
        setDepth: vi.fn(),
        destroy: vi.fn(),
      }),
    });
  });

  it("falls back to gameSceneConfig when Phaser passes an empty settings object", () => {
    const phaserInitScene = new GameScene({} as GameSceneConfig);
    expect((phaserInitScene as unknown as { config: GameSceneConfig }).config).toEqual(
      gameSceneConfig,
    );
  });

  it("loads all configured game assets", () => {
    scene.load = mockPartial<typeof scene.load>({
      setPath: vi.fn(),
      image: vi.fn(),
    });

    scene.preload();

    expect(scene.load.setPath).toHaveBeenCalledWith(gameSceneConfig.assetsPath);

    for (const image of gameSceneConfig.images) {
      expect(scene.load.image).toHaveBeenCalledWith(image.key, image.file);
    }
  });

  it("launches the configured menu scene and spawns the initial organism", () => {
    scene.create();

    const initialOrganism = organisms[gameSceneConfig.initialOrganismIndex];

    expect(scene.scene.launch).toHaveBeenCalledWith(gameSceneConfig.scenes.menu);
    expect(scene.scene.bringToTop).toHaveBeenCalledWith(
      gameSceneConfig.scenes.menu,
    );

    expect(Organism).toHaveBeenCalledWith(
      scene,
      initialOrganism.id,
      500 + initialOrganism.offsetX,
      500 + initialOrganism.offsetY,
      expect.anything(),
      expect.any(Function),
    );
  });

  it("spawns the second organism after configured delay when menu closes", () => {
    scene.create();

    const secondOrganism = organisms[gameSceneConfig.secondOrganismIndex];
    const menuClosedCallback = vi.mocked(scene.events.once).mock.calls[0][1];

    menuClosedCallback();

    expect(scene.scene.resume).toHaveBeenCalledOnce();
    expect(scene.time.delayedCall).toHaveBeenCalledWith(
      gameSceneConfig.secondOrganismSpawnDelayMs,
      expect.any(Function),
    );

    const delayedCallback = vi.mocked(scene.time.delayedCall).mock.calls[0][1];
    delayedCallback();

    expect(Organism).toHaveBeenCalledWith(
      scene,
      "amf", // <-- id comes second
      expect.any(Number), // <-- x
      expect.any(Number), // <-- y
      expect.anything(),
      expect.any(Function),
    );
  });

  it("launches the configured tutorial scene when the info button is clicked", () => {
    scene.create();

    expect(InfoButton).toHaveBeenCalledWith(
      scene,
      gameSceneConfig.infoButton.x,
      gameSceneConfig.infoButton.y,
    );

    const infoButtonCallback = vi.mocked(mockInfoButtonOn).mock.calls[0][1];
    infoButtonCallback();

    expect(scene.scene.launch).toHaveBeenCalledWith(
      gameSceneConfig.scenes.tutorial,
    );
  });

  it("highlights a missing connection pair and deducts configured hintCost when hint button is clicked", () => {
    scene.create();

    const menuClosedCallback = vi.mocked(scene.events.once).mock.calls[0][1];
    menuClosedCallback();

    const delayedCallback = vi.mocked(scene.time.delayedCall).mock.calls[0][1];
    delayedCallback();

    expect(HintButton).toHaveBeenCalledWith(
      scene,
      gameSceneConfig.hintButton.x,
      gameSceneConfig.hintButton.y,
    );

    const acacia = vi.mocked(Organism).mock.results[0].value;
    const amf = vi.mocked(Organism).mock.results[1].value;

    const hintButtonCallback = vi.mocked(mockHintButtonOn).mock.calls[0][1];
    hintButtonCallback();

    expect(acacia.highlight).toHaveBeenCalled();
    expect(amf.highlight).toHaveBeenCalled();
    expect((scene as unknown as { scoreManager: { money: number } }).scoreManager.money).toBe(
      gameSceneConfig.startingMoney - gameSceneConfig.hintCost,
    );
  });

  it("pauses and launches gameOver scene when out of money", () => {
    scene.create();

    const scoreManager = (
      scene as unknown as { scoreManager: { outOfMoney: () => void } }
    ).scoreManager;

    vi.mocked(scene.scene.pause).mockClear();
    scoreManager.outOfMoney();

    expect(scene.scene.pause).toHaveBeenCalledOnce();
    expect(scene.scene.launch).toHaveBeenCalledWith(
      gameSceneConfig.scenes.gameOver,
    );
  });

  it("does not deduct points when hint button is clicked and no connections are missing", () => {
    scene.create();

    const acacia = vi.mocked(Organism).mock.results[0].value;
    const hintButtonCallback = vi.mocked(mockHintButtonOn).mock.calls[0][1];
    hintButtonCallback();

    expect(acacia.highlight).not.toHaveBeenCalled();
    expect((scene as any).scoreManager.money).toBe(1000);
  });

  it("pauses properly on game start", () => {
    scene.create();
    expect(scene.scene.pause).toHaveBeenCalledTimes(1);
    expect(scene.scene.launch).toHaveBeenCalledWith(gameSceneConfig.scenes.menu);
  });
});
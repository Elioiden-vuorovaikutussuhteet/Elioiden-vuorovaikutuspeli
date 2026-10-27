import "vitest-canvas-mock";
import { mockDeep } from "vitest-mock-extended";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GameScene from "../../../src/game/scenes/GameScene";
import Organism from "../../../src/game/entities/organism";
import ArrowButtons from "../../../src/game/entities/arrowbuttons";
import { getRelation } from "../../../src/game/services/RelationsService";
import ArrowManager from "../../../src/game/managers/ArrowManager";
import InteractionManager from "../../../src/game/managers/InteractionManager";
import ConnectionManager from "../../../src/game/managers/ConnectionManager";
import OrganismManager from "../../../src/game/managers/OrganismManager";
import { ScoreManager } from "../../../src/game/managers/ScoreManager";
import { drawArrow } from "../../../src/game/services/DrawArrowService";
import PermanentArrow from "../../../src/game/entities/permanentarrow";

const {
  MockOrganism,
  mockOrganismOn,
  MockInfoButton,
  mockInfoButtonOn,
  MockHintButton,
  mockHintButtonOn,
  MockArrowButtons,
  MockCursorButton,
} = vi.hoisted(() => {
  const mockOrganismOn = vi.fn();
  const mockInfoButtonOn = vi.fn();
  const mockHintButtonOn = vi.fn();
  const mockArrowButtonsOn = vi.fn();
  const mockCursorButtonOn = vi.fn();

  const MockOrganism = vi.fn(function (
    ...[scene, id, x, y]: ConstructorParameters<typeof Organism>
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

vi.mock("../../../src/game/services/RelationsService", () => ({
  getRelation: vi.fn(),
}));

vi.mock("../../../src/game/entities/arrowbuttons", () => ({
  default: MockArrowButtons,
}));

vi.mock("../../../src/game/entities/cursorbutton", () => ({
  default: MockCursorButton,
}));

vi.mock("../../../src/game/services/DrawArrowService", () => ({
  drawArrow: vi.fn(),
}));

const { MockPermanentArrow } = vi.hoisted(() => ({
  MockPermanentArrow: vi.fn(function () {
    return {
      setStyle: vi.fn(),
      update: vi.fn(),
      playPulse: vi.fn(),
      setCursorMode: vi.fn(),
    };
  }),
}));

vi.mock("../../../src/game/entities/permanentarrow", () => ({
  default: MockPermanentArrow,
}));

const mockPartial = <T>(value: Partial<T>): T => value as T;

describe("GameScene", () => {
  let scene: GameScene;

  beforeEach(() => {
    vi.clearAllMocks();

    scene = new GameScene();

    scene.scale = mockPartial<typeof scene.scale>({
      width: 500,
      height: 500,
    });

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

    scene.input = mockPartial<typeof scene.input>({
      keyboard: {
        createCursorKeys: vi.fn().mockReturnValue({}),
      } as any,
      activePointer: {
        x: 500,
        y: 500,
        worldX: 500,
        worldY: 500,
        event: { shiftKey: false } as any,
      } as any,
      on: vi.fn(),
      setDraggable: vi.fn(),
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

  it("adds ants and then sapota when each relation set is completed", () => {
    vi.mocked(getRelation).mockReturnValue({
      value: 1,
      mult: 1,
    });
    scene.create();

    const menuClosedCallback = vi.mocked(scene.events.once).mock.calls[0][1];
    menuClosedCallback();

    const delayedCallback = vi.mocked(scene.time.delayedCall).mock.calls[0][1];
    delayedCallback();

    const acacia = vi.mocked(Organism).mock.results[0].value;
    const amf = vi.mocked(Organism).mock.results[1].value;

    // Filter specifically for "organismSelected" so "drag" listeners don't shift indices
    const selectOrganism = (index: number) =>
      mockOrganismOn.mock.calls.filter(
        (call) => call[0] === "organismSelected",
      )[index][1];

    selectOrganism(0).call(scene, acacia);
    selectOrganism(1).call(scene, amf);
    selectOrganism(1).call(scene, amf);
    selectOrganism(0).call(scene, acacia);

    expect(Organism).toHaveBeenCalledWith(
      scene,
      "ants",
      expect.any(Number),
      expect.any(Number),
      expect.anything(),
      expect.any(Function),
    );

    const ants = vi.mocked(Organism).mock.results[2].value;

    selectOrganism(0).call(scene, acacia);
    selectOrganism(2).call(scene, ants);
    selectOrganism(2).call(scene, ants);
    selectOrganism(0).call(scene, acacia);

    expect(Organism).toHaveBeenCalledWith(
      scene,
      "sapota",
      expect.any(Number),
      expect.any(Number),
      expect.anything(),
      expect.any(Function),
    );
  });

  it("logs to console after 2 organisms are selected", () => {
    vi.mocked(getRelation).mockReturnValue({
      value: 1,
      mult: 1,
    });
    scene.create();

    const menuClosedCallback = vi.mocked(scene.events.once).mock.calls[0][1];
    menuClosedCallback();

    const delayedCallback = vi.mocked(scene.time.delayedCall).mock.calls[0][1];
    delayedCallback();

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const firstOrganism = vi.mocked(Organism).mock.results[0].value;
    const secondOrganism = vi.mocked(Organism).mock.results[1].value;

    const selectedCallbacks = mockOrganismOn.mock.calls.filter(
      (call) => call[0] === "organismSelected",
    );
    const firstSelectionCallback = selectedCallbacks[0][1];
    const secondSelectionCallback = selectedCallbacks[1][1];

    firstSelectionCallback.call(scene, firstOrganism);
    secondSelectionCallback.call(scene, secondOrganism);

    expect(consoleLogSpy).toHaveBeenNthCalledWith(
      1,
      "acacia",
      expect.any(Number),
      expect.any(Number),
      1,
    );

    expect(consoleLogSpy).toHaveBeenNthCalledWith(
      2,
      "amf",
      expect.any(Number),
      expect.any(Number),
      1,
    );

    consoleLogSpy.mockRestore();
  });

  it("does nothing when the same organism is selected twice", () => {
    scene.create();

    const menuClosedCallback = vi.mocked(scene.events.once).mock.calls[0][1];
    menuClosedCallback();

    const delayedCallback = vi.mocked(scene.time.delayedCall).mock.calls[0][1];
    delayedCallback();

    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const organism = vi.mocked(Organism).mock.results[0].value;

    const selectionCallback = mockOrganismOn.mock.calls.filter(
      (call) => call[0] === "organismSelected",
    )[0][1];

    selectionCallback.call(scene, organism);
    selectionCallback.call(scene, organism);

    expect(consoleLogSpy).not.toHaveBeenCalled();

    consoleLogSpy.mockRestore();
  });

  it("creates green and red arrow buttons", () => {
    scene.create();

    expect(ArrowButtons).toHaveBeenNthCalledWith(
      1,
      scene,
      60,
      450,
      "greenbutton",
    );

    expect(ArrowButtons).toHaveBeenNthCalledWith(
      2,
      scene,
      60,
      550,
      "redbutton",
    );
  });
});

describe("ArrowManager interactions", () => {
  let scene: GameScene;
  let arrowManager: ArrowManager;
  let uiCamera: any;
  let interactionManager: InteractionManager;
  let connectionManager: ConnectionManager;
  let organismManager: OrganismManager;
  let scoreManager: ScoreManager;
  let interactions: any[];
  let permanentArrows: any;
  let previewArrow: any;

  beforeEach(() => {
    vi.clearAllMocks();

    scene = new GameScene();

    permanentArrows = {
      setDepth: vi.fn(),
      clear: vi.fn(),
      lineStyle: vi.fn(),
      fillStyle: vi.fn(),
      lineBetween: vi.fn(),
      fillTriangle: vi.fn(),
    };

    previewArrow = {
      setDepth: vi.fn(),
      clear: vi.fn(),
      lineStyle: vi.fn(),
      fillStyle: vi.fn(),
      lineBetween: vi.fn(),
      fillTriangle: vi.fn(),
    };

    (scene as any).scale = {
      width: 1920,
      height: 1080,
    };
    (scene as any).permanentArrows = permanentArrows;
    (scene as any).previewArrow = previewArrow;
    (scene as any).interactions = [];
    (scene as any).rightConnections = [];
    (scene as any).selectedOrganism = null;
    (scene as any).uiCamera = {
      ignore: vi.fn(),
    };
    (scene as any).scene = {
      launch: vi.fn(),
    };

    (scene as any).add = {
      graphics: vi.fn().mockReturnValue(previewArrow),
    };

    uiCamera = {
      ignore: vi.fn(),
    };

    interactionManager = {
      interactionPulse: vi.fn(),
    } as unknown as InteractionManager;

    connectionManager = {
      checkConnections: vi.fn().mockReturnValue(false),
    } as unknown as ConnectionManager;

    organismManager = {
      createOrganism: vi.fn(),
    } as unknown as OrganismManager;

    scoreManager = {
      money: 1000,
      getMoney: vi.fn(),
      loseMoney: vi.fn(),
    } as unknown as ScoreManager;

    interactions = [];
    arrowManager = new ArrowManager(
      scene,
      uiCamera,
      interactionManager,
      connectionManager,
      organismManager,
      scoreManager,
      interactions,
    );

    (scene as any).input = {
      activePointer: {
        x: 300,
        y: 250,
      },
    };
  });

  const organism = (id: string, x = 100, y = 100): Organism => {
    const org = {
      organismData: { id, name: id, texture: `${id}_sprite`, default_scale: 1 },
      x,
      y,
      HP: 100,
      changeHealth: vi.fn(),
      changeScale: vi.fn(),
      setPosition: vi.fn((newX: number, newY: number) => {
        org.x = newX;
        org.y = newY;
        return org;
      }),
    };
    return org as unknown as Organism;
  };

  it("valitsee ensimmäisen organismin", async () => {
  const first = organism("tree", 100, 100);

  arrowManager.arrowChecker(first);
  arrowManager.update();

  expect(drawArrow).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      x1: 100,
      y1: 100,
      color: 0x064f15,
      thickness: 2,
      lateralOffset: 0,
    }),
  );
});

  it("luo positiivisen vuorovaikutuksen", () => {
    vi.mocked(getRelation).mockReturnValue({
      value: 1,
      mult: 1,
    });

    const first = organism("tree");
    const second = organism("shroom", 300, 250);

    arrowManager.arrowChecker(first);
    arrowManager.arrowChecker(second);

    expect(interactions).toEqual([
      { from: "tree", to: "shroom" },
    ]);

    expect(PermanentArrow).toHaveBeenCalled();
    expect(arrowManager.getArrow("tree", "shroom")?.update)
      .toHaveBeenCalled();

    expect((scene as any).scene.launch).toHaveBeenCalledWith(
      "PopupScene",
      { textId: "tree-shroom" },
    );
  });

  it("luo negatiiviselle vuorovaikutukselle punaisen nuolen", () => {
    vi.mocked(getRelation).mockReturnValue({
      value: -1,
      mult: 1,
    });
    arrowManager.setArrowColorValue(false);
    const first = organism("tree", 100, 100);
    const second = organism("ant", 300, 250);

    arrowManager.arrowChecker(first as unknown as Organism);
    arrowManager.arrowChecker(second as unknown as Organism);

    const arrow = arrowManager.getArrow("tree", "ant");

    expect(arrow).toBeDefined();
    expect(arrow!.setStyle).toHaveBeenCalledWith(
      expect.objectContaining({
        color: 0xed0924,
        thickness: 8,
      }),
    );

    expect((scene as any).scene.launch).toHaveBeenCalledWith(
      "PopupScene",
      { textId: "tree-ant" },
    );
    expect((scene as any).scene.launch).toHaveBeenCalledWith("PopupScene", {
      textId: "tree-ant",
    });
  });

  it("ei lisää samaa vuorovaikutusta kahdesti", () => {
    vi.mocked(getRelation).mockReturnValue({
      value: 1,
      mult: 1,
    });

    const first = organism("tree");
    const second = organism("shroom");

    arrowManager.arrowChecker(first);
    arrowManager.arrowChecker(second);
    arrowManager.arrowChecker(first);
    arrowManager.arrowChecker(second);

    expect(interactions).toHaveLength(1);
  });

  it("ei luo vuorovaikutusta samaan organismiin", () => {
    const first = organism("tree");

    arrowManager.arrowChecker(first);
    arrowManager.arrowChecker(first);

    expect(interactions).toHaveLength(0);
    expect(getRelation).toHaveBeenCalledWith("tree", "tree");
  });

  // make and move to connectionmanager.test.ts
  it("tunnistaa oikeat yhteydet", () => {
    vi.mocked(connectionManager.checkConnections).mockReturnValue(true);

    const first = organism("tree");
    const second = organism("shroom");

    vi.mocked(getRelation).mockReturnValue({
      value: 1,
      mult: 1,
    });

    arrowManager.arrowChecker(first);
    arrowManager.arrowChecker(second);

    expect(connectionManager.checkConnections).toHaveBeenCalled();
  });

  // make and move to connectionmanager.test.ts
  it("hylkää puuttuvan yhteyden", () => {
    (scene as any).rightConnections = [{ from: "tree", to: "shroom" }];
    (scene as any).interactions = [];

    expect(connectionManager.checkConnections()).toBe(false);
  });

  it("returns missing connections from ConnectionManager", () => {
    const rightConnections = [
      { from: "acacia", to: "amf" },
      { from: "amf", to: "acacia" },
    ];
    const currentInteractions = [{ from: "acacia", to: "amf" }];
    const realConnectionManager = new ConnectionManager(
      rightConnections,
      currentInteractions,
    );

    expect(realConnectionManager.getMissingConnections()).toEqual([
      { from: "amf", to: "acacia" },
    ]);
  });

  it("tyhjentää esikatselunuolen valinnan jälkeen", () => {
    vi.mocked(getRelation).mockReturnValue({
      value: 1,
      mult: 1,
    });

    const first = organism("tree");
    const second = organism("shroom");

    arrowManager.arrowChecker(first);
    arrowManager.arrowChecker(second);

    expect(previewArrow.clear).toHaveBeenCalled();
  });

  it("updates and returns the right force configuration", () => {
    arrowManager.setForceConfig({
      linkDistance: 250,
      chargeStrength: -900,
      padding: 200,
    });

    const config = arrowManager.getForceConfig();

    expect(config.linkDistance).toBe(250);
    expect(config.chargeStrength).toBe(-900);
    expect(config.padding).toBe(200);
    expect(config.worldWidth).toBe(1920);
  });

  it("moves organisms with d3-force in update", () => {
    vi.mocked(getRelation).mockReturnValue({ value: 1, mult: 1 });

    const first = organism("tree", 200, 500);
    const second = organism("shroom", 1100, 500);

    arrowManager.arrowChecker(first);
    arrowManager.arrowChecker(second);

    arrowManager.update();

    expect(first.setPosition).toHaveBeenCalled();
    expect(second.setPosition).toHaveBeenCalled();
    expect(first.x).toBeGreaterThan(200);
    expect(second.x).toBeLessThan(1100);
  });

  it("clmaps organisms to the world bounds", () => {
    vi.mocked(getRelation).mockReturnValue({ value: 1, mult: 1 });

    const outOfBoundsOrg = organism("tree", 10, 2000);
    const normalOrg = organism("shroom", 500, 500);

    arrowManager.arrowChecker(outOfBoundsOrg);
    arrowManager.arrowChecker(normalOrg);

    arrowManager.update();

    const { padding, worldWidth, worldHeight } = arrowManager.getForceConfig();

    expect(outOfBoundsOrg.x).toBeGreaterThanOrEqual(padding);
    expect(outOfBoundsOrg.x).toBeLessThanOrEqual(worldWidth - padding);
    expect(outOfBoundsOrg.y).toBeGreaterThanOrEqual(padding);
    expect(outOfBoundsOrg.y).toBeLessThanOrEqual(worldHeight - padding);
  });

  it("redraws permanent arrows when organisms move", () => {
    vi.mocked(getRelation).mockReturnValue({value: 1, mult: 1});

    const first = organism("tree", 200, 300);
    const second = organism("shroom", 600, 300);

    arrowManager.arrowChecker(first);
    arrowManager.arrowChecker(second);

    const arrow = arrowManager.getArrow("tree", "shroom");

    expect(arrow).toBeDefined();

    vi.mocked(arrow!.update).mockClear();

    first.x = 250;
    first.y = 450;

    arrowManager.update();

    expect(arrow!.update).toHaveBeenCalledWith(first, second);
  });

  it("offsets bidirectional arrows into parallel lanes", () => {
    vi.mocked(getRelation).mockReturnValue({
      value: 1,
      mult: 1,
    });

    const first = organism("tree", 300, 500);
    const second = organism("shroom", 700, 500);

    arrowManager.arrowChecker(first);
    arrowManager.arrowChecker(second);

    expect(
      arrowManager.getArrow("tree", "shroom")?.setStyle,
    ).toHaveBeenLastCalledWith(
      expect.objectContaining({ lateralOffset: 0 }),
    );

    arrowManager.arrowChecker(second);
    arrowManager.arrowChecker(first);

    expect(
      arrowManager.getArrow("tree", "shroom")?.setStyle,
    ).toHaveBeenLastCalledWith(
      expect.objectContaining({ lateralOffset: 25 }),
    );

    expect(
      arrowManager.getArrow("shroom", "tree")?.setStyle,
    ).toHaveBeenLastCalledWith(
      expect.objectContaining({ lateralOffset: 25 }),
    );
  });
});
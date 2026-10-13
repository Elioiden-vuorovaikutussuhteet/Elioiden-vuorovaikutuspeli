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

const {
  MockOrganism,
  mockOrganismOn,
  MockInfoButton,
  mockInfoButtonOn,
  MockArrowButtons,
} = vi.hoisted(() => {
  const mockOrganismOn = vi.fn();
  const mockInfoButtonOn = vi.fn();
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
vi.mock("../../../src/game/services/RelationsService", () => ({
  getRelation: vi.fn(),
}));

vi.mock("../../../src/game/entities/arrowbuttons", () => ({
  default: MockArrowButtons,
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
    const selectOrganism = (index: number) =>
      mockOrganismOn.mock.calls[index][1];

    selectOrganism(0).call(scene, acacia);
    selectOrganism(1).call(scene, amf);
    selectOrganism(1).call(scene, amf);
    selectOrganism(0).call(scene, acacia);

    expect(Organism).toHaveBeenCalledWith(scene, 600, 500, "ants", expect.anything(), expect.any(Function));

    const ants = vi.mocked(Organism).mock.results[2].value;

    selectOrganism(0).call(scene, acacia);
    selectOrganism(2).call(scene, ants);
    selectOrganism(2).call(scene, ants);
    selectOrganism(0).call(scene, acacia);

    expect(Organism).toHaveBeenCalledWith(scene, 1300, 500, "sapota", expect.anything(), expect.any(Function));
  });

  it("logs to console after 2 organisms are selected", () => {
    // edit this test once arrow making function is called instead of log
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => { });

    vi.mocked(getRelation).mockReturnValue({
      value: 1,
      mult: 1,
    });
    scene.create();

    const menuClosedCallback = vi.mocked(scene.events.once).mock.calls[0][1];

    menuClosedCallback();

    const delayedCallback = vi.mocked(scene.time.delayedCall).mock.calls[0][1];

    delayedCallback();

    const firstOrganism = vi.mocked(Organism).mock.results[0].value;

    const secondOrganism = vi.mocked(Organism).mock.results[1].value;

    const firstSelectionCallback = mockOrganismOn.mock.calls[0][1];

    const secondSelectionCallback = mockOrganismOn.mock.calls[1][1];

    firstSelectionCallback.call(scene, firstOrganism);
    secondSelectionCallback.call(scene, secondOrganism);

    expect(consoleLogSpy).toHaveBeenNthCalledWith(1, "acacia", 500, 300, 1);

    expect(consoleLogSpy).toHaveBeenNthCalledWith(2, "amf", 500, 700, 1);

    consoleLogSpy.mockRestore();
  });

  it("does nothing when the same organism is selected twice", () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => { });

    scene.create();

    const menuClosedCallback = vi.mocked(scene.events.once).mock.calls[0][1];

    menuClosedCallback();

    const delayedCallback = vi.mocked(scene.time.delayedCall).mock.calls[0][1];

    delayedCallback();

    const organism = vi.mocked(Organism).mock.results[0].value;

    const selectionCallback = mockOrganismOn.mock.calls[0][1];

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

    (scene as any).permanentArrows = permanentArrows;
    (scene as any).previewArrow = previewArrow;
    (scene as any).interactions = [];
    (scene as any).rightConnections = [];
    (scene as any).selectedOrganism = null;
    (scene as any).uiCamera = {
      ignore: vi.fn(),
    };

    (scene as any).add = {
        graphics: vi.fn()
        .mockReturnValueOnce(permanentArrows)
        .mockReturnValueOnce(previewArrow),
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

    interactions = [];
    arrowManager = new ArrowManager(scene,
      uiCamera,
      interactionManager,
      connectionManager,
      organismManager,
      interactions,
    );

    (scene as any).input = {
      activePointer: {
        x: 300,
        y: 250,
      },
    };
  });

  const organism = (id: string, x = 100, y = 100) => ({
    organismData: { id },
    x,
    y,
    HP: 100,
    changeHealth: vi.fn(),
    changeScale: vi.fn(),
  });

  it("valitsee ensimmäisen organismin", () => {
    const first = organism("tree");

    arrowManager.arrowChecker(first);
    arrowManager.update();

    expect(previewArrow.lineBetween).toHaveBeenCalled();
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
    expect(permanentArrows.lineBetween).toHaveBeenCalled();
    expect(permanentArrows.fillTriangle).toHaveBeenCalled();
    expect((scene as any).selectedOrganism).toBeNull();
  });

  it("luo negatiiviselle vuorovaikutukselle punaisen nuolen", () => {
    vi.mocked(getRelation).mockReturnValue({
      value: -1,
      mult: 1,
    });
    arrowManager.setArrowColorValue(false);
    const first = organism("tree");
    const second = organism("ant");

    arrowManager.arrowChecker(first);
    arrowManager.arrowChecker(second);

    expect(permanentArrows.lineStyle).toHaveBeenCalledWith(4, 0xed0924);
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
});
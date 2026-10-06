import "vitest-canvas-mock";
import { mockDeep } from "vitest-mock-extended";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GameScene from "../../../src/game/scenes/GameScene";
import Organism from "../../../src/game/entities/organism";
import InfoButton from "../../../src/game/entities/infobutton";
import ArrowButtons from "../../../src/game/entities/arrowbuttons";
import { getRelation } from "../../../src/game/RelationsService";

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
vi.mock("../../../src/game/RelationsService", () => ({
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

    expect(Organism).toHaveBeenCalledWith(scene, 500, 300, "acacia");
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

    expect(Organism).toHaveBeenCalledWith(scene, 500, 700, "amf");
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

    expect(Organism).toHaveBeenCalledWith(scene, 600, 500, "ants");

    const ants = vi.mocked(Organism).mock.results[2].value;

    selectOrganism(0).call(scene, acacia);
    selectOrganism(2).call(scene, ants);
    selectOrganism(2).call(scene, ants);
    selectOrganism(0).call(scene, acacia);

    expect(Organism).toHaveBeenCalledWith(scene, 1300, 500, "sapota");
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

  it("launches the tutorial scene when the info button is clicked", () => {
    scene.create();

    expect(InfoButton).toHaveBeenCalledWith(scene, 40, 40);

    const infoButtonCallback = vi.mocked(mockInfoButtonOn).mock.calls[0][1];

    infoButtonCallback();

    expect(scene.scene.launch).toHaveBeenCalledWith("TutorialScene");
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

  it('pauses properly on game start', () => {
    scene.create()
    expect(scene.scene.pause).toHaveBeenCalledTimes(1);
    expect(scene.scene.launch).toHaveBeenCalledWith('MenuScene');
  });

});

describe("GameScene Camera System", () => {
  let scene: GameScene;


  beforeEach(() => {
    vi.clearAllMocks();

    scene = new GameScene();
  });

  describe("create()", () => {

    beforeEach(() => {
      vi.clearAllMocks();

      scene = new GameScene();

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

      scene.scene = mockPartial<typeof scene.scene>({
        launch: vi.fn(),
        pause: vi.fn(),
        bringToTop: vi.fn(),
        resume: vi.fn(),
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
      });

      scene.events = mockPartial<typeof scene.events>({
        once: vi.fn(),
      });

      scene.time = mockPartial<typeof scene.time>({
        delayedCall: vi.fn(),
      });
    });

    it("configures bounds to 1 screen left and 3 screens wide", () => {
      scene.create();

      expect(scene.cameras.main.setBounds).toHaveBeenCalledWith(
        -1920,
        -1080,
        5760,
        3240,
      );
      expect(scene.cameras.main.scrollX).toBe(0);
    });

    it("registers a wheel event listener on input", () => {
      scene.create();

      expect(scene.input.on).toHaveBeenCalledWith(
        "wheel",
        expect.any(Function),
      );
    });
  });

  it('zooms camera on wheel event', () => {
    const scene = new GameScene()
    let wheelCallback!: Function

    const mockCam = {
      zoom: 1.0,
      setZoom: vi.fn(function (val) {
        mockCam.zoom = Number(val.toFixed(2))
      }),
    }

    scene.input = {
      on: vi.fn((event, cb) => {
        if (event === 'wheel') wheelCallback = cb
      }),
    } as any

    scene.setupCameraZoom(mockCam as any)

    wheelCallback(null, [], 0, -100)
    expect(mockCam.setZoom).toHaveBeenCalledWith(1.1)

    wheelCallback(null, [], 0, 100)
    expect(mockCam.setZoom).toHaveBeenCalledWith(1.0)
  })

  describe('updateCamera', () => {
    let scene: GameScene
    let mockCam: { scrollX: number; scrollY: number }

    const setCursors = (state: {
      left?: boolean
      right?: boolean
      up?: boolean
      down?: boolean
    }) => {
      ; (scene as any).cursors = {
        left: { isDown: state.left ?? false },
        right: { isDown: state.right ?? false },
        up: { isDown: state.up ?? false },
        down: { isDown: state.down ?? false },
      }
    }

    beforeEach(() => {
      scene = new GameScene()
      mockCam = {
        scrollX: 100,
        scrollY: 100,
      }
      setCursors({})
    })

    it('does not scroll camera when no keys are pressed', () => {
      scene.updateCamera(mockCam as any)

      expect(mockCam.scrollX).toBe(100)
      expect(mockCam.scrollY).toBe(100)
    })

    describe('Horizontal movement', () => {
      it('moves left by speed (10) when left cursor is down', () => {
        setCursors({ left: true })
        scene.updateCamera(mockCam as any)

        expect(mockCam.scrollX).toBe(90)
        expect(mockCam.scrollY).toBe(100)
      })

      it('moves right by speed (10) when right cursor is down', () => {
        setCursors({ right: true })
        scene.updateCamera(mockCam as any)

        expect(mockCam.scrollX).toBe(110)
        expect(mockCam.scrollY).toBe(100)
      })

    })

    describe('Vertical movement', () => {
      it('moves up by speed (10) when up cursor is down', () => {
        setCursors({ up: true })
        scene.updateCamera(mockCam as any)

        expect(mockCam.scrollX).toBe(100)
        expect(mockCam.scrollY).toBe(90)
      })

      it('moves down by speed (10) when down cursor is down', () => {
        setCursors({ down: true })
        scene.updateCamera(mockCam as any)

        expect(mockCam.scrollX).toBe(100)
        expect(mockCam.scrollY).toBe(110)
      })

    })
  })

  describe('setupCameraDrag', () => {
    let scene: GameScene
    let mockCam: { scrollX: number; scrollY: number; zoom: number }
    let mockMouse: { disableContextMenu: ReturnType<typeof vi.fn> }
    let handlers: Record<string, (pointer: any) => void>

    // Helper to generate pointer event states
    const createPointer = (options: {
      x: number
      y: number
      rightDown?: boolean
      rightReleased?: boolean
    }) => ({
      x: options.x,
      y: options.y,
      rightButtonDown: () => options.rightDown ?? false,
      rightButtonReleased: () => options.rightReleased ?? false,
    })

    beforeEach(() => {
      scene = new GameScene()
      handlers = {}

      mockCam = {
        scrollX: 100,
        scrollY: 100,
        zoom: 1.0,
      }

      mockMouse = {
        disableContextMenu: vi.fn(),
      }

      scene.input = {
        mouse: mockMouse,
        on: vi.fn((event: string, cb: (pointer: any) => void) => {
          handlers[event] = cb
        }),
      } as any

      scene.setupCameraDrag(mockCam as any)
    })

    it('disables right-click context menu', () => {
      expect(mockMouse.disableContextMenu).toHaveBeenCalledTimes(1)
    })

    it('scrolls the camera opposite to drag direction when dragging with right click', () => {
      handlers['pointerdown'](createPointer({ x: 200, y: 200, rightDown: true }))

      handlers['pointermove'](createPointer({ x: 250, y: 230 }))

      expect(mockCam.scrollX).toBe(50)
      expect(mockCam.scrollY).toBe(70)
    })

    it('updates drag origin incrementally during multiple moves', () => {
      handlers['pointerdown'](createPointer({ x: 100, y: 100, rightDown: true }))

      handlers['pointermove'](createPointer({ x: 120, y: 110 }))
      expect(mockCam.scrollX).toBe(80)
      expect(mockCam.scrollY).toBe(90)

      handlers['pointermove'](createPointer({ x: 130, y: 120 }))
      expect(mockCam.scrollX).toBe(70)
      expect(mockCam.scrollY).toBe(80)
    })

    it('scales distance according to camera zoom', () => {
      mockCam.zoom = 2.0

      handlers['pointerdown'](createPointer({ x: 100, y: 100, rightDown: true }))
      handlers['pointermove'](createPointer({ x: 200, y: 200 }))

      expect(mockCam.scrollX).toBe(50) // 100 - 50
      expect(mockCam.scrollY).toBe(50) // 100 - 50
    })

    it('does not pan if moving without dragging active', () => {
      handlers['pointermove'](createPointer({ x: 300, y: 300 }))

      expect(mockCam.scrollX).toBe(100)
      expect(mockCam.scrollY).toBe(100)
    })

    it('does not initiate drag if button down is not right click', () => {
      handlers['pointerdown'](createPointer({ x: 200, y: 200, rightDown: false }))
      handlers['pointermove'](createPointer({ x: 250, y: 250 }))

      expect(mockCam.scrollX).toBe(100)
      expect(mockCam.scrollY).toBe(100)
    })

    it('stops dragging when right button is released', () => {
      handlers['pointerdown'](createPointer({ x: 100, y: 100, rightDown: true }))
      handlers['pointermove'](createPointer({ x: 150, y: 150 }))
      expect(mockCam.scrollX).toBe(50)

      handlers['pointerup'](createPointer({ x: 150, y: 150, rightReleased: true }))

      handlers['pointermove'](createPointer({ x: 200, y: 200 }))
      expect(mockCam.scrollX).toBe(50)
      expect(mockCam.scrollY).toBe(50)
    })

    it('ignores release events from non-right buttons while dragging', () => {
      handlers['pointerdown'](createPointer({ x: 100, y: 100, rightDown: true }))

      handlers['pointerup'](createPointer({ x: 100, y: 100, rightReleased: false }))

      handlers['pointermove'](createPointer({ x: 150, y: 100 }))
      expect(mockCam.scrollX).toBe(50)
    })
  })
});

describe("GameScene interactions", () => {
  let scene: GameScene;
  let permanentArrows: any;
  let previewArrow: any;

  beforeEach(() => {
    vi.clearAllMocks();

    scene = new GameScene();

    permanentArrows = {
      clear: vi.fn(),
      lineStyle: vi.fn(),
      fillStyle: vi.fn(),
      lineBetween: vi.fn(),
      fillTriangle: vi.fn(),
    };

    previewArrow = {
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

    (scene as any).getStartEndOrganisms(first);

    expect((scene as any).selectedOrganism).toBe(first);
  });

  it("luo positiivisen vuorovaikutuksen", () => {
    vi.mocked(getRelation).mockReturnValue({
      value: 1,
      mult: 1,
    });

    const first = organism("tree");
    const second = organism("shroom", 300, 250);

    (scene as any).getStartEndOrganisms(first);
    (scene as any).getStartEndOrganisms(second);

    expect((scene as any).interactions).toEqual([
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
    (scene as any).arrowColorValue = false;
    const first = organism("tree");
    const second = organism("ant");

    (scene as any).getStartEndOrganisms(first);
    (scene as any).getStartEndOrganisms(second);

    expect(permanentArrows.lineStyle).toHaveBeenCalledWith(4, 0xed0924);
  });

  it("ei lisää samaa vuorovaikutusta kahdesti", () => {
    vi.mocked(getRelation).mockReturnValue({
      value: 1,
      mult: 1,
    });

    const first = organism("tree");
    const second = organism("shroom");

    (scene as any).getStartEndOrganisms(first);
    (scene as any).getStartEndOrganisms(second);
    (scene as any).getStartEndOrganisms(first);
    (scene as any).getStartEndOrganisms(second);

    expect((scene as any).interactions).toHaveLength(1);
  });

  it("ei luo vuorovaikutusta samaan organismiin", () => {
    const first = organism("tree");

    (scene as any).getStartEndOrganisms(first);
    (scene as any).getStartEndOrganisms(first);

    expect((scene as any).interactions).toHaveLength(0);
    expect(getRelation).toHaveBeenCalledWith("tree", "tree");
  });

  it("tunnistaa oikeat yhteydet", () => {
    (scene as any).rightConnections = [{ from: "tree", to: "shroom" }];
    (scene as any).interactions = [{ from: "tree", to: "shroom" }];

    expect((scene as any).checkConnections()).toBe(true);
  });

  it("hylkää puuttuvan yhteyden", () => {
    (scene as any).rightConnections = [{ from: "tree", to: "shroom" }];
    (scene as any).interactions = [];

    expect((scene as any).checkConnections()).toBe(false);
  });

  it("tyhjentää esikatselunuolen valinnan jälkeen", () => {
    vi.mocked(getRelation).mockReturnValue({
      value: 1,
      mult: 1,
    });

    const first = organism("tree");
    const second = organism("shroom");

    (scene as any).getStartEndOrganisms(first);
    (scene as any).getStartEndOrganisms(second);

    expect(previewArrow.clear).toHaveBeenCalled();
  });
});

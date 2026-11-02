import "vitest-canvas-mock";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type Phaser from "phaser";
import CameraManager from "../../../src/game/managers/CameraManager";
import { cameraConfig } from "../../../src/game/config/cameraConfig";

describe("CameraManager", () => {
  let manager: CameraManager;
  let scene: Phaser.Scene;
  let camera: {
    width: number;
    height: number;
    scrollX: number;
    scrollY: number;
    zoom: number;
    setBounds: ReturnType<typeof vi.fn>;
  };
  let uiCamera: {
    setScroll: ReturnType<typeof vi.fn>;
    setZoom: ReturnType<typeof vi.fn>;
    ignore: ReturnType<typeof vi.fn>;
  };
  let cursors: {
    left: { isDown: boolean };
    right: { isDown: boolean };
    up: { isDown: boolean };
    down: { isDown: boolean };
  };
  let mockMouse: { disableContextMenu: ReturnType<typeof vi.fn> };
  let handlers: Record<string, (...args: any[]) => void>;

  const createPointer = (options: {
    x: number;
    y: number;
    rightDown?: boolean;
    rightReleased?: boolean;
  }) => ({
    x: options.x,
    y: options.y,
    rightButtonDown: () => options.rightDown ?? false,
    rightButtonReleased: () => options.rightReleased ?? false,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    handlers = {};

    camera = {
      width: 1920,
      height: 1080,
      scrollX: 0,
      scrollY: 0,
      zoom: 1,
      setBounds: vi.fn(),
    };

    uiCamera = {
      setScroll: vi.fn(),
      setZoom: vi.fn(),
      ignore: vi.fn(),
    };

    cursors = {
      left: { isDown: false },
      right: { isDown: false },
      up: { isDown: false },
      down: { isDown: false },
    };

    mockMouse = {
      disableContextMenu: vi.fn(),
    };

    scene = {
      cameras: {
        main: camera,
        add: vi.fn().mockReturnValue(uiCamera),
      },
      input: {
        keyboard: {
          createCursorKeys: vi.fn().mockReturnValue(cursors),
        },
        mouse: mockMouse,
        on: vi.fn((event: string, callback: (...args: any[]) => void) => {
          handlers[event] = callback;
        }),
      },
    } as unknown as Phaser.Scene;

    manager = new CameraManager(scene);
  });

  describe("Initialization", () => {
    it("configures bounds to 1 screen left and 3 screens wide", () => {
      expect(camera.setBounds).toHaveBeenCalledWith(-1920, -1080, 5760, 3240);
      expect(camera.scrollX).toBe(0);
      expect(manager.getUICamera()).toBe(uiCamera);
    });

    it("registers wheel and pointer event listeners and disables context menu", () => {
      expect(scene.input.on).toHaveBeenCalledWith("wheel", expect.any(Function));
      expect(mockMouse.disableContextMenu).toHaveBeenCalledOnce();
    });
  });

  describe("Wheel Zoom", () => {
    it("zooms camera on wheel event and scrolls toward the cursor", () => {
      camera.width = 800;
      camera.height = 600;

      // 1. Zoom in with cursor at (600, 450)
      handlers["wheel"]({ x: 600, y: 450 }, [], 0, -100);

      const expectedZoomIn = 1.0 * cameraConfig.zoomInFactor;
      const zoomInDelta = 1 / 1.0 - 1 / expectedZoomIn;

      expect(camera.zoom).toBeCloseTo(expectedZoomIn);
      expect(camera.scrollX).toBeCloseTo(200 * zoomInDelta);
      expect(camera.scrollY).toBeCloseTo(150 * zoomInDelta);

      // 2. Zoom out with cursor at center (400, 300)
      const prevScrollX = camera.scrollX;
      const prevScrollY = camera.scrollY;
      const expectedZoomOut = camera.zoom * cameraConfig.zoomOutFactor;

      handlers["wheel"]({ x: 400, y: 300 }, [], 0, 100);

      expect(camera.zoom).toBeCloseTo(expectedZoomOut);
      expect(camera.scrollX).toBeCloseTo(prevScrollX);
      expect(camera.scrollY).toBeCloseTo(prevScrollY);
    });
  });

  describe("Cursor Movement (update)", () => {
    beforeEach(() => {
      camera.scrollX = 100;
      camera.scrollY = 100;
    });

    it("does not scroll camera when no keys are pressed", () => {
      manager.update();
      expect(camera.scrollX).toBe(100);
      expect(camera.scrollY).toBe(100);
    });

    it.each([
      ["left", { left: true }, 100 - cameraConfig.speed, 100],
      ["right", { right: true }, 100 + cameraConfig.speed, 100],
      ["up", { up: true }, 100, 100 - cameraConfig.speed],
      ["down", { down: true }, 100, 100 + cameraConfig.speed],
    ])("moves %s by cameraConfig.speed when key is down", (_dir, keys, expectedX, expectedY) => {
      Object.assign(cursors, {
        left: { isDown: false },
        right: { isDown: false },
        up: { isDown: false },
        down: { isDown: false },
        ...Object.fromEntries(Object.entries(keys).map(([k, v]) => [k, { isDown: v }])),
      });

      manager.update();
      expect(camera.scrollX).toBe(expectedX);
      expect(camera.scrollY).toBe(expectedY);
    });
  });

  describe("Camera Drag", () => {
    beforeEach(() => {
      camera.scrollX = 100;
      camera.scrollY = 100;
      camera.zoom = 1.0;
    });

    it("scrolls opposite to drag direction when dragging with right click", () => {
      handlers["pointerdown"](createPointer({ x: 200, y: 200, rightDown: true }));
      handlers["pointermove"](createPointer({ x: 250, y: 230 }));

      expect(camera.scrollX).toBe(50);
      expect(camera.scrollY).toBe(70);
    });

    it("updates drag origin incrementally during multiple moves", () => {
      handlers["pointerdown"](createPointer({ x: 100, y: 100, rightDown: true }));

      handlers["pointermove"](createPointer({ x: 120, y: 110 }));
      expect(camera.scrollX).toBe(80);
      expect(camera.scrollY).toBe(90);

      handlers["pointermove"](createPointer({ x: 130, y: 120 }));
      expect(camera.scrollX).toBe(70);
      expect(camera.scrollY).toBe(80);
    });

    it("scales distance according to camera zoom", () => {
      camera.zoom = 2.0;

      handlers["pointerdown"](createPointer({ x: 100, y: 100, rightDown: true }));
      handlers["pointermove"](createPointer({ x: 200, y: 200 }));

      expect(camera.scrollX).toBe(50);
      expect(camera.scrollY).toBe(50);
    });

    it("does not pan if moving without dragging active or with non-right click", () => {
      handlers["pointermove"](createPointer({ x: 300, y: 300 }));
      handlers["pointerdown"](createPointer({ x: 200, y: 200, rightDown: false }));
      handlers["pointermove"](createPointer({ x: 250, y: 250 }));

      expect(camera.scrollX).toBe(100);
      expect(camera.scrollY).toBe(100);
    });

    it("stops dragging only when right button is released", () => {
      handlers["pointerdown"](createPointer({ x: 100, y: 100, rightDown: true }));
      handlers["pointermove"](createPointer({ x: 150, y: 150 }));
      expect(camera.scrollX).toBe(50);

      // Non-right release should be ignored
      handlers["pointerup"](createPointer({ x: 150, y: 150, rightReleased: false }));
      handlers["pointermove"](createPointer({ x: 170, y: 150 }));
      expect(camera.scrollX).toBe(30);

      // Right release stops drag
      handlers["pointerup"](createPointer({ x: 170, y: 150, rightReleased: true }));
      handlers["pointermove"](createPointer({ x: 220, y: 200 }));
      expect(camera.scrollX).toBe(30);
      expect(camera.scrollY).toBe(50);
    });
  });
});
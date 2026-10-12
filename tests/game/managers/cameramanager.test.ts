import "vitest-canvas-mock";
import { mockDeep } from "vitest-mock-extended";
import { beforeEach, describe, expect, it, vi } from "vitest";
import GameScene from "../../../src/game/scenes/GameScene";
import CameraManager from "../../../src/game/managers/CameraManager";

describe("GameScene Camera System", () => {
  let manager: CameraManager;
  let scene: GameScene;
  let camera: any;
  let uiCamera: any;
  let handlers: Record<string, (pointer: any) => void>;
  let cursors: any;

  beforeEach(() => {
  vi.clearAllMocks();

  scene = new GameScene();

  camera = {
    width: 1920,
    height: 1080,
    scrollX: 0,
    scrollY: 0,
    zoom: 1,
    setBounds: vi.fn(),
    setZoom: vi.fn(function (value: number) {
      camera.zoom = value;
    }),
    setScroll: vi.fn(),
  };

  uiCamera = {
    setScroll: vi.fn(),
    setZoom: vi.fn(),
    ignore: vi.fn(),
  };

  scene.cameras = {
    main: camera,
    add: vi.fn().mockReturnValue(uiCamera),
  } as any;

  cursors = {
    left: { isDown: false },
    right: { isDown: false },
    up: { isDown: false },
    down: { isDown: false },
  };

  handlers = {};

  scene.input = {
    keyboard: {
      createCursorKeys: vi.fn().mockReturnValue(cursors),
    },
    mouse: {
      disableContextMenu: vi.fn(),
    },
    on: vi.fn((event: string, callback: (...args: any[]) => void) => {
      handlers[event] = callback;
    }),
  } as any;

  manager = new CameraManager(scene);
});

  const mockPartial = <T,>(value: Partial<T>): T => value as T;

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
      scene.input.keyboard = mockPartial<typeof scene.input.keyboard>({
        createCursorKeys: vi.fn().mockReturnValue(cursors),
      });
      scene.input.on = vi.fn();
      scene.input.mouse = mockPartial<typeof scene.input.mouse>({
        disableContextMenu: vi.fn(),
      });

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
      manager = new CameraManager(scene);

      expect(scene.cameras.main.setBounds).toHaveBeenCalledWith(
        -1920,
        -1080,
        5760,
        3240,
      );
      expect(scene.cameras.main.scrollX).toBe(0);
    });

    it("registers a wheel event listener on input", () => {
      manager = new CameraManager(scene);

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

    const manager = Object.create(CameraManager.prototype) as CameraManager
    ;(manager as any).scene = scene
    ;(manager as any).setupCameraZoom(mockCam as any)

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
      const manager = Object.create(CameraManager.prototype) as CameraManager
      ;(manager as any).cursors = (scene as any).cursors
      ;(manager as any).updateCamera(mockCam as any)

      expect(mockCam.scrollX).toBe(100)
      expect(mockCam.scrollY).toBe(100)
    })

    describe('Horizontal movement', () => {
      it('moves left by speed (10) when left cursor is down', () => {
        setCursors({ left: true })
        const manager = Object.create(CameraManager.prototype) as CameraManager
        ;(manager as any).cursors = (scene as any).cursors
        ;(manager as any).updateCamera(mockCam as any)

        expect(mockCam.scrollX).toBe(90)
        expect(mockCam.scrollY).toBe(100)
      })

      it('moves right by speed (10) when right cursor is down', () => {
        setCursors({ right: true })
        const manager = Object.create(CameraManager.prototype) as CameraManager
        ;(manager as any).cursors = (scene as any).cursors
        ;(manager as any).updateCamera(mockCam as any)

        expect(mockCam.scrollX).toBe(110)
        expect(mockCam.scrollY).toBe(100)
      })

    })

    describe('Vertical movement', () => {
      it('moves up by speed (10) when up cursor is down', () => {
        setCursors({ up: true })
        const manager = Object.create(CameraManager.prototype) as CameraManager
        ;(manager as any).cursors = (scene as any).cursors
        ;(manager as any).updateCamera(mockCam as any)

        expect(mockCam.scrollX).toBe(100)
        expect(mockCam.scrollY).toBe(90)
      })

      it('moves down by speed (10) when down cursor is down', () => {
        setCursors({ down: true })
        const manager = Object.create(CameraManager.prototype) as CameraManager
        ;(manager as any).cursors = (scene as any).cursors
        ;(manager as any).updateCamera(mockCam as any)

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

      const manager = Object.create(CameraManager.prototype) as CameraManager
      ;(manager as any).scene = scene
      ;(manager as any).setupCameraDrag(mockCam as any)
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

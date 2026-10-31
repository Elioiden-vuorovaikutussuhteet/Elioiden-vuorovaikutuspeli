import { describe, it, expect, vi, beforeEach } from "vitest";
import type Phaser from "phaser";

vi.mock("phaser", () => ({
  default: {},
}));

const mockPermanentArrowInstances: Array<{
  fromId: string;
  toId: string;
  onClick: () => void;
  setStyle: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  playPulse: ReturnType<typeof vi.fn>;
  setCursorMode: ReturnType<typeof vi.fn>;
}> = [];

vi.mock("../../../src/game/entities/permanentarrow", () => ({
  default: vi.fn().mockImplementation(function (
    _scene: unknown,
    _uiCamera: unknown,
    fromId: string,
    toId: string,
    _style: unknown,
    onClick: () => void,
  ) {
    const instance = {
      fromId,
      toId,
      onClick,
      setStyle: vi.fn(),
      update: vi.fn(),
      playPulse: vi.fn(),
      setCursorMode: vi.fn(),
    };
    mockPermanentArrowInstances.push(instance);
    return instance;
  }),
}));

vi.mock("../../../src/game/services/DrawArrowService", () => ({
  drawArrow: vi.fn(),
}));

vi.mock("../../../src/game/services/RelationsService", () => ({
  getRelation: vi.fn(),
}));

import ArrowRenderer from "../../../src/game/managers/ArrowRenderer";
import type Organism from "../../../src/game/entities/organism";
import { drawArrow } from "../../../src/game/services/DrawArrowService";
import { getRelation } from "../../../src/game/services/RelationsService";
import { arrowUIConfig } from "../../../src/game/config/uiConfig";

describe("ArrowRenderer", () => {
  let mockScene: Phaser.Scene;
  let mockUiCamera: Phaser.Cameras.Scene2D.Camera;
  let mockGraphics: {
    setDepth: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };
  let renderer: ArrowRenderer;

  const createOrganism = (id: string, x = 100, y = 200): Organism =>
    ({
      organismData: { id },
      x,
      y,
    }) as unknown as Organism;

  beforeEach(() => {
    mockPermanentArrowInstances.length = 0;
    vi.clearAllMocks();

    mockGraphics = {
      setDepth: vi.fn(),
      clear: vi.fn(),
    };

    mockScene = {
      add: { graphics: vi.fn(() => mockGraphics) },
      input: { activePointer: { worldX: 300, worldY: 400 } },
    } as unknown as Phaser.Scene;

    mockUiCamera = {
      ignore: vi.fn(),
    } as unknown as Phaser.Cameras.Scene2D.Camera;

    renderer = new ArrowRenderer(mockScene, mockUiCamera);
  });

  it("initializes preview graphics and ignores it on uiCamera", () => {
    expect(mockScene.add.graphics).toHaveBeenCalledOnce();
    expect(mockGraphics.setDepth).toHaveBeenCalledWith(100);
    expect(mockUiCamera.ignore).toHaveBeenCalledWith(mockGraphics);
  });

  it("creates and updates permanent arrows with styles from arrowUIConfig", () => {
    vi.mocked(getRelation).mockImplementation((from, to) =>
      from === "ants" && to === "sapota"
        ? ({ value: 1 } as never)
        : ({ value: -1 } as never),
    );

    const ants = createOrganism("ants", 10, 20);
    const sapota = createOrganism("sapota", 50, 60);
    const map = new Map([
      ["ants", ants],
      ["sapota", sapota],
    ]);

    const onClick = vi.fn();

    renderer.redrawPermanentArrows(
      [{ from: "ants", to: "sapota" }],
      map,
      65,
      false,
      onClick,
    );

    expect(renderer.getArrows().size).toBe(1);
    const arrow = renderer.getArrow("ants", "sapota")!;
    expect(arrow.setStyle).toHaveBeenCalledWith({
      targetOffset: 65,
      color: arrowUIConfig.positiveColor,
      thickness: arrowUIConfig.permanentThickness,
      lateralOffset: 0,
    });
    expect(arrow.update).toHaveBeenCalledWith(ants, sapota);

    renderer.redrawPermanentArrows(
      [
        { from: "ants", to: "sapota" },
        { from: "sapota", to: "ants" },
      ],
      map,
      65,
      false,
      onClick,
    );

    expect(renderer.getArrows().size).toBe(2);
    expect(arrow.setStyle).toHaveBeenLastCalledWith({
      targetOffset: 65,
      color: arrowUIConfig.positiveColor,
      thickness: arrowUIConfig.permanentThickness,
      lateralOffset: arrowUIConfig.bidirectionalOffset,
    });

    mockPermanentArrowInstances[0].onClick();
    expect(onClick).toHaveBeenCalledWith("ants", "sapota");
  });

  it("draws preview arrow with styles from arrowUIConfig", () => {
    const ants = createOrganism("ants", 120, 180);

    renderer.drawPreview(ants, true);
    expect(mockGraphics.clear).toHaveBeenCalledOnce();
    expect(drawArrow).toHaveBeenCalledWith(mockGraphics, {
      x1: 120,
      y1: 180,
      x2: 300,
      y2: 400,
      color: arrowUIConfig.positiveColor,
      thickness: arrowUIConfig.previewThickness,
      lateralOffset: 0,
    });

    renderer.drawPreview(ants, false);
    expect(drawArrow).toHaveBeenLastCalledWith(mockGraphics, {
      x1: 120,
      y1: 180,
      x2: 300,
      y2: 400,
      color: arrowUIConfig.negativeColor,
      thickness: arrowUIConfig.previewThickness,
      lateralOffset: 0,
    });
  });

  it("forwards pulse animations and cursor mode changes to permanent arrows", () => {
    vi.mocked(getRelation).mockReturnValue({ value: 1 } as never);
    const map = new Map([
      ["ants", createOrganism("ants")],
      ["sapota", createOrganism("sapota")],
    ]);

    renderer.redrawPermanentArrows(
      [{ from: "ants", to: "sapota" }],
      map,
      65,
      false,
      vi.fn(),
    );

    renderer.playPulse("ants", "sapota", 10);
    expect(mockPermanentArrowInstances[0].playPulse).toHaveBeenCalledWith(10);

    renderer.setCursorMode(true);
    expect(mockPermanentArrowInstances[0].setCursorMode).toHaveBeenCalledWith(true);
  });
});
import "vitest-canvas-mock";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type Phaser from "phaser";
import OrganismManager from "../../../src/game/managers/OrganismManager";
import type Organism from "../../../src/game/entities/organism";
import type { Connection } from "../../../src/game/types/Connection";

describe("OrganismManager", () => {
  let scene: Phaser.Scene;
  let uiCamera: Phaser.Cameras.Scene2D.Camera;
  let organismMap: Map<string, Organism>;
  let rightConnections: Connection[];
  let organismManager: OrganismManager;

  const createMockOrganism = (id: string): Organism =>
    ({organismData: { id }, destroy: vi.fn(),}) as unknown as Organism;

  beforeEach(() => {
    vi.clearAllMocks();

    scene = {} as Phaser.Scene;
    uiCamera = {ignore: vi.fn(),} as unknown as Phaser.Cameras.Scene2D.Camera;
    organismMap = new Map();
    rightConnections = [{ from: "tree", to: "shroom" }];
    organismManager = new OrganismManager(
      scene,
      uiCamera,
      organismMap,
      rightConnections,
      vi.fn(),
    );
  });

  it("deletes organism from list, map and right connections", () => {
    const tree = createMockOrganism("tree");
    const shroom = createMockOrganism("shroom");

    (organismManager as unknown as { organisms: Organism[] }).organisms = [tree, shroom];
    organismMap.set("tree", tree);
    organismMap.set("shroom", shroom);

    organismManager.deleteOrganism(tree);

    expect(organismManager.getOrganisms()).toEqual([shroom]);
    expect(organismManager.getOrganismMap().has("tree")).toBe(false);
    expect(organismManager.getOrganismMap().get("shroom")).toBe(shroom);
    expect(tree.destroy).toHaveBeenCalledOnce();
    expect(rightConnections).not.toContainEqual({from: "tree", to: "shroom",});
  });
});
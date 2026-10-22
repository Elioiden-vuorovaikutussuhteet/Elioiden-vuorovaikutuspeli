import Phaser from "phaser";
import ArrowButtons from "../entities/arrowbuttons";
import type Organism from "../entities/organism";
import { getRelation } from "../services/RelationsService";
import type { Connection } from "../types/Connection";
import InteractionManager from "./InteractionManager";
import ConnectionManager from "./ConnectionManager";
import OrganismManager from "./OrganismManager";
import { getInteractionId } from "../data/popupTexts";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type Simulation,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";

export interface OrganismSpawn {
  type: string;
  x: number;
  y: number;
}

export interface ForceLayoutConfig {
  /** Target length of arrows between connected organisms (px) */
  linkDistance: number;
  /** How strongly connected organisms pull toward each other (0 to 1) */
  linkStrength: number;
  /** Repulsion between all organisms (negative pushes apart, e.g. -1500) */
  chargeStrength: number;
  /** Minimum radius around each organism so sprites don't overlap (px) */
  collideRadius: number;
  /** How strongly overlapping organisms push apart (0 to 1) */
  collideStrength: number;
  /** Center point of the layout area */
  centerX: number;
  centerY: number;
  /** Pull strength toward the center (0 to 1) */
  centerStrength: number;
  /** How quickly movement settles (lower = longer/smoother glide, e.g. 0.02 - 0.05) */
  alphaDecay: number;
  /** Energy injected when an arrow is drawn or organism spawns (0.1 = gentle nudge, 1.0 = energetic) */
  reheatAlpha: number;
  /** World bounds & edge padding to clamp organism coordinates */
  worldWidth: number;
  worldHeight: number;
  padding: number;
  /** Distance from target organism center where the arrowhead tip stops (px) */
  arrowTargetOffset: number;
}

// These can be edited for arrow force configuration
export const DEFAULT_FORCE_CONFIG: ForceLayoutConfig = {
  linkDistance: 380,
  linkStrength: 0.6,
  chargeStrength: -1500,
  collideRadius: 160,
  collideStrength: 0.9,
  centerX: 800,
  centerY: 500,
  centerStrength: 0.08,
  alphaDecay: 0.03,
  reheatAlpha: 0.5,
  worldWidth: 1600,
  worldHeight: 1000,
  padding: 150,
  arrowTargetOffset: 65,
};

interface ForceNode extends SimulationNodeDatum {
  id: string;
  organism: Organism;
  x: number;
  y: number;
}

interface ForceLink extends SimulationLinkDatum<ForceNode> {
  source: string | ForceNode;
  target: string | ForceNode;
}

// arrow related code, drawing of arrows, arrow buttons 
export default class ArrowManager {
  private scene: Phaser.Scene;
  private uiCamera: Phaser.Cameras.Scene2D.Camera;

  private interactionManager!: InteractionManager;
  private connectionManager!: ConnectionManager;
  private organismManager!: OrganismManager;

  private permanentArrows!: Phaser.GameObjects.Graphics;
  private previewArrow!: Phaser.GameObjects.Graphics;
  private arrowColorValue: boolean = true;
  private selectedOrganism: Organism | null = null;
  private interactions: Connection[];

  private readonly organismSpawnOrder: OrganismSpawn[];

  private readonly defaultOrganismSpawnOrder: OrganismSpawn[] = [
    { type: "ants", x: 600, y: 500 },
    { type: "sapota", x: 1300, y: 500 },
    { type: "antfootbacteria", x: 200, y: 700 },
    { type: "diazotroph", x: 300, y: 500 },
    { type: "glomeromycetes", x: 900, y: 300 },
    { type: "mycorrhizahelper", x: 1300, y: 700 },
  ];
  private nextOrganismToSpawn = 0;

  // Dynamic d3-force state & configuration
  private forceConfig: ForceLayoutConfig = { ...DEFAULT_FORCE_CONFIG };
  private simulation: Simulation<ForceNode, ForceLink>;
  private linkForce = forceLink<ForceNode, ForceLink>([]).id((d) => d.id);
  private forceNodes: ForceNode[] = [];
  private forceLinks: ForceLink[] = [];
  private knownOrganisms = new Map<string, Organism>();

  constructor(
    scene: Phaser.Scene,
    uiCamera: Phaser.Cameras.Scene2D.Camera,
    interactionManager: InteractionManager,
    connectionManager: ConnectionManager,
    organismManager: OrganismManager,
    interactions: Connection[],
    organismSpawnOrder: OrganismSpawn[] = this.defaultOrganismSpawnOrder,
    forceConfig: Partial<ForceLayoutConfig> = {},
  ) {
    this.scene = scene;
    this.uiCamera = uiCamera;
    this.interactionManager = interactionManager;
    this.connectionManager = connectionManager;
    this.organismManager = organismManager;
    this.interactions = interactions;
    this.organismSpawnOrder = organismSpawnOrder.map((o) => ({ ...o }));

    this.initGraphics();

    this.simulation = forceSimulation<ForceNode, ForceLink>([]).stop();
    this.setForceConfig(forceConfig);

    if (import.meta.env?.DEV && typeof window !== "undefined") {
      (window as unknown as Record<string, unknown>).arrowManager = this;
    }
  }

  private initGraphics() {
    this.permanentArrows = this.scene.add.graphics();
    this.previewArrow = this.scene.add.graphics();

    this.permanentArrows.setDepth(100);
    this.previewArrow.setDepth(100);

    this.uiCamera.ignore(this.permanentArrows);
    this.uiCamera.ignore(this.previewArrow);
  }

  /**
   * Apply force parameters and wake up the simulation.
   */
  public setForceConfig(newConfig: Partial<ForceLayoutConfig>) {
    this.forceConfig = { ...this.forceConfig, ...newConfig };
    const cfg = this.forceConfig;

    this.linkForce.distance(cfg.linkDistance).strength(cfg.linkStrength);

    this.simulation
      .force("link", this.linkForce)
      .force("charge", forceManyBody<ForceNode>().strength(cfg.chargeStrength))
      .force(
        "center",
        forceCenter<ForceNode>(cfg.centerX, cfg.centerY).strength(cfg.centerStrength),
      )
      .force(
        "collide",
        forceCollide<ForceNode>(cfg.collideRadius).strength(cfg.collideStrength),
      )
      .alphaDecay(cfg.alphaDecay);

    this.recalculateLayout();
    this.redrawPermanentArrows();
  }

  public getForceConfig(): ForceLayoutConfig {
    return { ...this.forceConfig };
  }

  /**
   * Sync active organisms and connections into d3-force 
   */
  public recalculateLayout() {
    this.forceNodes = this.syncForceNodes();
    this.forceLinks = this.buildForceLinks();

    this.simulation.nodes(this.forceNodes);
    this.linkForce.links(this.forceLinks);
    this.simulation.alpha(this.forceConfig.reheatAlpha);
  }

  private syncForceNodes(): ForceNode[] {
    const existingById = new Map(this.forceNodes.map((n) => [n.id, n]));

    return this.getActiveOrganisms().map((organism) => {
      const id = organism.organismData.id;
      const existing = existingById.get(id);

      return existing
        ? Object.assign(existing, { organism, x: organism.x, y: organism.y })
        : { id, organism, x: organism.x, y: organism.y };
    });
  }

  private buildForceLinks(): ForceLink[] {
    const links: ForceLink[] = [];

    for (let i = 0; i < this.forceNodes.length; i++) {
      for (let j = i + 1; j < this.forceNodes.length; j++) {
        const idA = this.forceNodes[i].id;
        const idB = this.forceNodes[j].id;

        if (this.hasRelation(idA, idB)) {
          links.push({ source: idA, target: idB });
        }
      }
    }

    return links;
  }

  private hasRelation(idA: string, idB: string): boolean {
    return (
      (getRelation(idA, idB)?.value ?? 0) !== 0 ||
      (getRelation(idB, idA)?.value ?? 0) !== 0 ||
      this.interactions.some(
        (c) =>
          (c.from === idA && c.to === idB) ||
          (c.from === idB && c.to === idA),
      )
    );
  }

  /**
   * Retrieve currently spawned Organism instances from OrganismManager,
   * falling back to knownOrganisms so mocked unit tests work .
   */
  private getActiveOrganisms(): Organism[] {
    const manager = this.organismManager as unknown as {
      getOrganisms?: () => Organism[];
      organisms?: Organism[];
    };
    let list: Organism[] = [];
    if (typeof manager.getOrganisms === "function") {
      list = manager.getOrganisms();
    } else if (Array.isArray(manager.organisms)) {
      list = manager.organisms;
    }

    for (const org of list) {
      this.knownOrganisms.set(org.organismData.id, org);
    }

    return list.length > 0 ? list : Array.from(this.knownOrganisms.values());
  }

  public arrowChecker(organism: Organism) {
    this.knownOrganisms.set(organism.organismData.id, organism);

    if (this.selectedOrganism === null) {
      this.selectedOrganism = organism;
      return;
    }

    const first = this.selectedOrganism;
    const second = organism;
    const relationData = getRelation(
      first.organismData.id,
      second.organismData.id,
    );
    const relation = relationData["value"];
    const multiplier = relationData["mult"];

    const arrowColorValue = this.getArrowColorValue();

    if (first.organismData.id === second.organismData.id) {
      return;
    }

    // Create arrow if it doesnt exist yet
    if (
      !this.interactions.some(
        (interaction) =>
          interaction.from === first.organismData.id &&
          interaction.to === second.organismData.id,
      )
    ) {
      // relation is positive = green(0x064f15), bad = red(0xed0924)
      if (
        (relation === 1 && arrowColorValue === true) ||
        (relation === -1 && arrowColorValue === false)
      ) {
        this.interactions.push({
          from: first.organismData.id,
          to: second.organismData.id,
        });

        // finds popup text from data/popuptexts.ts and launches the window
        const textId = getInteractionId(
          first.organismData.id,
          second.organismData.id,
        );
        this.scene.scene.launch("PopupScene", { textId });

        const healthChange = relation * multiplier * (first.HP / 100);
        second.changeHealth(healthChange);
        this.interactionManager.interactionPulse(second, relation);

        this.recalculateLayout();
      }
    }

    this.clearPreview();

    console.log(first.organismData.id, first.x, first.y, relation);
    console.log(second.organismData.id, second.x, second.y, relation);

    const allRelationsCorrect = this.connectionManager.checkConnections();

    const nextOrganism = this.organismSpawnOrder[this.nextOrganismToSpawn];
    if (allRelationsCorrect && nextOrganism) {
      const created = this.organismManager.createOrganism(
        nextOrganism.x,
        nextOrganism.y,
        nextOrganism.type,
      ) as Organism | void;

      if (created && created.organismData) {
        this.knownOrganisms.set(created.organismData.id, created);
      }

      this.nextOrganismToSpawn += 1;
      this.recalculateLayout();
    }

    this.redrawPermanentArrows();
    this.selectedOrganism = null;
  }

  public redrawPermanentArrows() {
    this.permanentArrows.clear();
    const activeOrganisms = this.getActiveOrganisms();

    for (const interaction of this.interactions) {
      const first =
        activeOrganisms.find((o) => o.organismData.id === interaction.from) ??
        this.knownOrganisms.get(interaction.from);
      const second =
        activeOrganisms.find((o) => o.organismData.id === interaction.to) ??
        this.knownOrganisms.get(interaction.to);

      if (!first || !second) continue;

      const relation = getRelation(
        first.organismData.id,
        second.organismData.id,
      )?.value;
      const isPositive = relation === 1;
      const color = isPositive ? 0x064f15 : 0xed0924;
      const thickness = isPositive ? 8 : 4;

      const dx = second.x - first.x;
      const dy = second.y - first.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const targetOffset = this.forceConfig.arrowTargetOffset;
      const targetX = second.x - (dx / dist) * targetOffset;
      const targetY = second.y - (dy / dist) * targetOffset;

      this.drawArrow(
        this.permanentArrows,
        first.x,
        first.y,
        targetX,
        targetY,
        color,
        thickness,
      );
    }
  }

  public drawArrow(
    graphics: Phaser.GameObjects.Graphics,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: number,
    thickness: number,
  ) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    const lineLength = Math.sqrt(dx * dx + dy * dy);
    if (lineLength === 0) return;

    // Line unit vector
    const udx = dx / lineLength;
    const udy = dy / lineLength;

    // Perpendicular unit vector
    const pdx = -udy;
    const pdy = udx;

    // Arrowhead base vertices
    const x3 = x2 - 20 * udx + 15 * pdx;
    const y3 = y2 - 20 * udy + 15 * pdy;
    const x4 = x2 - 20 * udx - 15 * pdx;
    const y4 = y2 - 20 * udy - 15 * pdy;

    this.uiCamera.ignore(this.previewArrow);
    this.uiCamera.ignore(this.permanentArrows);

    graphics.lineStyle(thickness, color);
    graphics.fillStyle(color, 1);

    graphics.lineBetween(x1, y1, x2 - 15 * udx, y2 - 15 * udy);
    graphics.fillTriangle(x2, y2, x3, y3, x4, y4);
  }

  public createArrowButtons(centerY: number) {
    const greenButton = new ArrowButtons(
      this.scene,
      60,
      centerY - 50,
      "greenbutton",
    );
    const redButton = new ArrowButtons(
      this.scene,
      60,
      centerY + 50,
      "redbutton",
    );

    this.scene.cameras.main.ignore(greenButton);
    this.scene.cameras.main.ignore(redButton);

    greenButton.on("arrowButtonClicked", () => {
      this.arrowColorValue = true;
      console.log(this.arrowColorValue);
    });

    redButton.on("arrowButtonClicked", () => {
      this.arrowColorValue = false;
      console.log(this.arrowColorValue);
    });
  }

  public getArrowColorValue() {
    return this.arrowColorValue;
  }

  // for testing
  public setArrowColorValue(value: boolean) {
    this.arrowColorValue = value;
  }

  public clearPreview() {
    this.previewArrow.clear();
    this.selectedOrganism = null;
  }

  public getPermanentArrows() {
    return this.permanentArrows;
  }

  public update() {
    // Step dynamic d3-force simulation if active
    if (this.simulation.alpha() > this.simulation.alphaMin()) {
      this.simulation.tick();

      const { padding, worldWidth, worldHeight } = this.forceConfig;
      for (const node of this.forceNodes) {
        const clampedX = Phaser.Math.Clamp(
          node.x,
          padding,
          worldWidth - padding,
        );
        const clampedY = Phaser.Math.Clamp(
          node.y,
          padding,
          worldHeight - padding,
        );

        node.x = clampedX;
        node.y = clampedY;
        node.organism.setPosition(clampedX, clampedY);

      }
    }

    // Redraw permanent arrows so they track moving organisms
    this.redrawPermanentArrows();

    // Draw active preview arrow
    this.previewArrow.clear();

    if (this.selectedOrganism === null) {
      return;
    }

    const color = this.arrowColorValue ? 0x064f15 : 0xed0924;

    this.drawArrow(
      this.previewArrow,
      this.selectedOrganism.x,
      this.selectedOrganism.y,
      this.scene.input.activePointer.worldX,
      this.scene.input.activePointer.worldY,
      color,
      2,
    );
  }
}
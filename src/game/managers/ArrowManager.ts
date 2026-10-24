import Phaser from "phaser";
import ArrowButtons from "../entities/arrowbuttons";
import type Organism from "../entities/organism";
import { getRelation } from "../services/RelationsService";
import type { Connection } from "../types/Connection";
import InteractionManager from "./InteractionManager";
import ConnectionManager from "./ConnectionManager";
import OrganismManager from "./OrganismManager";
import { ScoreManager } from "./ScoreManager";
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
  linkDistance: 260,
  linkStrength: 0.9,
  chargeStrength: -1000,
  collideRadius: 180,
  collideStrength: 0.9,
  centerX: 960,
  centerY: 540,
  centerStrength: 0.08,
  alphaDecay: 0.03,
  reheatAlpha: 0.5,
  worldWidth: 1920,
  worldHeight: 1080,
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

interface PermanentArrow {
  key: string;
  fromId: string;
  toId: string;

  graphics: Phaser.GameObjects.Graphics;
}

// arrow related code, drawing of arrows, arrow buttons 
export default class ArrowManager {
  private scene: Phaser.Scene;
  private uiCamera: Phaser.Cameras.Scene2D.Camera;

  private interactionManager!: InteractionManager;
  private connectionManager!: ConnectionManager;
  private organismManager!: OrganismManager;
  private scoreManager!: ScoreManager;

  private permanentArrows = new Map<string, PermanentArrow>();
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

  private getPermanentArrowKey(fromId: string, toId: string): string {
    return JSON.stringify([fromId, toId]);
  }

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
    scoreManager: ScoreManager,
    interactions: Connection[],
    organismSpawnOrder: OrganismSpawn[] = this.defaultOrganismSpawnOrder,
    forceConfig: Partial<ForceLayoutConfig> = {},
  ) {
    this.scene = scene;
    this.uiCamera = uiCamera;
    this.interactionManager = interactionManager;
    this.connectionManager = connectionManager;
    this.organismManager = organismManager;
    this.scoreManager = scoreManager;
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
    this.previewArrow = this.scene.add.graphics();
    this.previewArrow.setDepth(100);
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

  private createArrow(
    fromId: string,
    toId: string,
  ): PermanentArrow {
    const key = this.getPermanentArrowKey(fromId, toId);

    const graphics = this.scene.add.graphics();
    graphics.setDepth(100);

    this.uiCamera.ignore(graphics);

    const arrow: PermanentArrow = {
      key,
      fromId,
      toId,
      graphics,
    };

    this.permanentArrows.set(key, arrow);

    return arrow;
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
    // Fix test
    if (first.organismData.id === second.organismData.id || !relationData) {
      this.clearPreview();
      return;
    }

    const relation = relationData["value"];
    const multiplier = relationData["mult"];

    const arrowColorValue = this.getArrowColorValue();

    if (first.organismData.id === second.organismData.id) {
      this.selectedOrganism = null;
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
      if (relation === 1 && arrowColorValue === true) {
        this.interactions.push({
          from: first.organismData.id,
          to: second.organismData.id,
        });

        const textId = getInteractionId(
          first.organismData.id,
          second.organismData.id,
        );

        this.scene.scene.launch("PopupScene", { textId });
        this.scoreManager.getMoney();

        const healthChange = relation * multiplier * (first.HP / 100);
        second.changeHealth(healthChange);
        this.interactionManager.interactionPulse(second, relation);

        this.recalculateLayout();
      }

      else if (relation === -1 && arrowColorValue === false) {
        this.interactions.push({
          from: first.organismData.id,
          to: second.organismData.id,
        });

        const textId = getInteractionId(
          first.organismData.id,
          second.organismData.id,
        );

        this.scene.scene.launch("PopupScene", { textId });
        this.scoreManager.getMoney();

        const healthChange = relation * multiplier * (first.HP / 100);
        second.changeHealth(healthChange);
        this.interactionManager.interactionPulse(second, relation);

        this.recalculateLayout();
      } else {
        // lose money if wrong guess
        this.scoreManager.loseMoney();
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
    const activeOrganisms = this.getActiveOrganisms();

    const organismsById = new Map(
      activeOrganisms.map((organism) => [
        organism.organismData.id,
        organism,
      ]),
    );

    const activeKeys = new Set(
      this.interactions.map(({ from, to }) =>
        this.getPermanentArrowKey(from, to),
      ),
    );

    // Remove arrows whose connections no longer exist.
    for (const [key, arrow] of this.permanentArrows) {
      if (!activeKeys.has(key)) {
        arrow.graphics.destroy();
        this.permanentArrows.delete(key);
      }
    }

    // Create missing arrows and redraw existing ones.
    for (const interaction of this.interactions) {
      const { from, to } = interaction;

      const first =
        organismsById.get(from) ?? this.knownOrganisms.get(from);

      const second =
        organismsById.get(to) ?? this.knownOrganisms.get(to);

      if (!first || !second) continue;

      const key = this.getPermanentArrowKey(from, to);

      const arrow =
        this.permanentArrows.get(key) ??
        this.createArrow(from, to);

      const relation = getRelation(from, to)?.value;
      const color =
        relation === 1 ? 0x064f15 : 0xed0924;

      // Match the existing bidirectional-arrow behavior.
      const isBidirectional = this.interactions.some(
        (other) => other.from === to && other.to === from,
      );

      const lateralOffset = isBidirectional ? 25 : 0;

      const dx = second.x - first.x;
      const dy = second.y - first.y;
      const distance = Math.hypot(dx, dy) || 1;

      const targetOffset = this.forceConfig.arrowTargetOffset;

      const targetX =
        second.x - (dx / distance) * targetOffset;

      const targetY =
        second.y - (dy / distance) * targetOffset;

      arrow.graphics.clear();

      this.drawArrow(
        arrow.graphics,
        first.x,
        first.y,
        targetX,
        targetY,
        color,
        8,
        lateralOffset,
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
    lateralOffset: number = 0, // 0 = center line, >0 = shifted right
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

    // Apply lateral lane shift 
    const sx1 = x1 + pdx * lateralOffset;
    const sy1 = y1 + pdy * lateralOffset;
    const sx2 = x2 + pdx * lateralOffset;
    const sy2 = y2 + pdy * lateralOffset;

    // Arrowhead base vertices
    const x3 = sx2 - 20 * udx + 15 * pdx;
    const y3 = sy2 - 20 * udy + 15 * pdy;
    const x4 = sx2 - 20 * udx - 15 * pdx;
    const y4 = sy2 - 20 * udy - 15 * pdy;

    // this.uiCamera.ignore(this.previewArrow);
    // this.uiCamera.ignore(this.permanentArrows);

    graphics.lineStyle(thickness, color);
    graphics.fillStyle(color, 1);

    graphics.lineBetween(sx1, sy1, sx2 - 15 * udx, sy2 - 15 * udy);
    graphics.fillTriangle(sx2, sy2, x3, y3, x4, y4);
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

  public getArrows(): ReadonlyMap<string, PermanentArrow> {
    return this.permanentArrows;
  }

  public getArrow(fromId: string, toId: string): PermanentArrow | undefined {
    return this.permanentArrows.get(this.getPermanentArrowKey(fromId, toId));
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

    //Fix tests
    const pointer = this.scene.input.activePointer;
    const targetX = pointer.worldX ?? pointer.x ?? 0;
    const targetY = pointer.worldY ?? pointer.y ?? 0;

    this.drawArrow(
      this.previewArrow,
      this.selectedOrganism.x,
      this.selectedOrganism.y,
      targetX,
      targetY,
      color,
      2,
    );
  }
}
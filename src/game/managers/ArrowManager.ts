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
  forceX,
  forceY,
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
  /** Organisms further apart than this ignore each other */
  chargeDistanceMax: number;
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
  /** Distance how far away unconnected organisms affect */
  distanceMax: number;
}

// These can be edited for arrow force configuration
export const DEFAULT_FORCE_CONFIG: ForceLayoutConfig = {
  linkDistance: 500,
  linkStrength: 0.9,
  chargeStrength: -1000,
  collideRadius: 180,
  collideStrength: 0.9,
  centerX: 960,
  centerY: 540,
  centerStrength: 0.02,
  chargeDistanceMax: 500,
  alphaDecay: 0.03,
  reheatAlpha: 0.5,
  worldWidth: 1920,
  worldHeight: 1080,
  padding: 150,
  arrowTargetOffset: 65,
  distanceMax: 500,
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
  private scoreManager!: ScoreManager;

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

    //Update force config with screen info
    const width = scene.scale.width;
    const height = scene.scale.height;

    this.forceConfig = {
      ...DEFAULT_FORCE_CONFIG,
      worldWidth: width,
      worldHeight: height,
      centerX: width / 2,
      centerY: height / 2,
    };

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

    const centerX = this.scene.scale.width / 2;
    const centerY = this.scene.scale.height / 2;

    if (this.scene.scale.width > this.scene.scale.height) {
      this.simulation
      // Weak X 
      .force("x", forceX<ForceNode>(centerX).strength(0.005))
      // Strong Y - organisms are pushed towards a horizontal line. 
      .force("y", forceY<ForceNode>(centerY).strength(0.08));
    } else {
      this.simulation
      // Strong X 
      .force("x", forceX<ForceNode>(centerX).strength(0.08))
      // Weak Y - organisms are pushed towards a vertical line.
      .force("y", forceY<ForceNode>(centerY).strength(0.005));
    }
    

    // Update the charge force with a max distance 
    this.simulation.force(
      "charge",
      forceManyBody<ForceNode>()
        .strength(this.forceConfig.chargeStrength)
        .distanceMax(500),
    );

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
    //Shift drag for debug
    if (this.scene.input?.activePointer?.event?.shiftKey) return;

    this.knownOrganisms.set(organism.organismData.id, organism);
    this.enableDrag(organism);

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
        this.drawArrow(
          this.getPermanentArrows(),
          first.x,
          first.y,
          this.scene.input.activePointer.worldX,
          this.scene.input.activePointer.worldY,
          0x064f15,
          4,
        );
        this.interactions.push({
          from: first.organismData.id,
          to: second.organismData.id,
        });

        //finds popup text from data/popuptexts.ts and launches the window
        const textId = getInteractionId(first.organismData.id, second.organismData.id);
        this.scene.scene.launch("PopupScene", { textId });
        this.scoreManager.getMoney();

        const healthChange = relation * multiplier * (first.HP / 100);
        second.changeHealth(healthChange);
        this.interactionManager.interactionPulse(second, relation);
        this.recalculateLayout();

      } else if (relation === -1 && arrowColorValue === false) {
        this.drawArrow(
          this.getPermanentArrows(),
          first.x,
          first.y,
          this.scene.input.activePointer.worldX,
          this.scene.input.activePointer.worldY,
          0xed0924,
          4,
        );
        this.interactions.push({
          from: first.organismData.id,
          to: second.organismData.id,
        });

        //finds popup text from data/popuptexts.ts and launches the window
        const textId = getInteractionId(first.organismData.id, second.organismData.id);
        this.scene.scene.launch("PopupScene", { textId });
        this.scoreManager.getMoney();

        const healthChange = relation * multiplier * (first.HP / 100);
        second.changeHealth(healthChange);
        this.interactionManager.interactionPulse(second, relation);


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
        this.enableDrag(created);
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
      const thickness = isPositive ? 8 : 8;

      // Check if there is an opposing arrow (B -> A)
      const isBidirectional = this.interactions.some(
        (other) =>
          other.from === interaction.to && other.to === interaction.from,
      );

      // If bidirectional shift sideways by 25px
      const lateralOffset = isBidirectional ? 25 : 0;

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

    this.uiCamera.ignore(this.previewArrow);
    this.uiCamera.ignore(this.permanentArrows);

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

  public getPermanentArrows() {
    return this.permanentArrows;
  }

  private draggableOrganisms = new WeakSet<Organism>();

  private enableDrag(organism: Organism) {
    if (this.draggableOrganisms.has(organism) || typeof organism.on !== "function") {
      return;
    }
    this.draggableOrganisms.add(organism);

    organism.setInteractive?.({ draggable: true });
    this.scene.input?.setDraggable?.(organism);

    organism.on("drag", (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      if (!pointer.event.shiftKey) return;

      organism.setPosition(dragX, dragY);
      this.recalculateLayout();
      this.redrawPermanentArrows();
    });
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
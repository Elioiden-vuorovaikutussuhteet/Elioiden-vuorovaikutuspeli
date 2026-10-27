import Phaser from "phaser";
import ArrowButtons from "../entities/arrowbuttons";
import type Organism from "../entities/organism";
import { organismDataMap } from "../data/organisms";
import { getRelation } from "../services/RelationsService";
import type { Connection } from "../types/Connection";
import InteractionManager from "./InteractionManager";
import ConnectionManager from "./ConnectionManager";
import OrganismManager from "./OrganismManager";
import PermanentArrow from "../entities/permanentarrow";
import { drawArrow } from "../services/DrawArrowService";
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

  private permanentArrows = new Map<string, PermanentArrow>();
  private previewArrow!: Phaser.GameObjects.Graphics;
  private arrowColorValue: boolean = true;
  private selectedOrganism: Organism | null = null;
  private interactions: Connection[];

  public getSpawnPosition(id: string): { x: number; y: number } {
    const centerX = this.forceConfig.centerX;
    const centerY = this.forceConfig.centerY;

    const data = organismDataMap.get(id);
    if (!data) {
      return { x: centerX, y: centerY };
    }

    return {
      x: centerX + data.offsetX,
      y: centerY + data.offsetY,
    };
  }

  //Spawn order modified to be just strings of the id, spawn location is moved to data/organisms.ts. First 2 organisms are still spawned in gamescene
  private readonly defaultOrganismSpawnOrder: readonly string[] = [
    "ants",
    "sapota",
    "antfootbacteria",
    "diazotroph",
    "glomeromycetes",
    "mycorrhizahelper",
  ];
  public organismSpawnOrder: string[] = [];

  private nextOrganismToSpawn = 0;

  private getPermanentArrowKey(fromId: string, toId: string): string {
    return JSON.stringify([fromId, toId]);
  }

  public playArrowPulseAnimation(fromId: string, toId: string, hpChange: number): void {
    const key = this.getPermanentArrowKey(fromId, toId);
    const arrow = this.permanentArrows.get(key);

    arrow?.playPulse(hpChange);
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
    forceConfig: Partial<ForceLayoutConfig> = {},
  ) {

    this.scene = scene;
    this.uiCamera = uiCamera;
    this.interactionManager = interactionManager;
    this.connectionManager = connectionManager;
    this.organismManager = organismManager;
    this.scoreManager = scoreManager;
    this.interactions = interactions;

    this.organismSpawnOrder = [...this.defaultOrganismSpawnOrder];

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
    this.previewArrow = this.scene.add.graphics();
    this.previewArrow.setDepth(100);
    this.uiCamera.ignore(this.previewArrow);
  }

  /**
   * Apply force parameters and wake up the simulation.
   */
  public setForceConfig(newConfig: Partial<ForceLayoutConfig>) {
    this.forceConfig = { ...this.forceConfig, ...newConfig };
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
    this.linkForce
      .links(this.forceLinks)
      .distance(this.forceConfig.linkDistance)
      .strength(this.forceConfig.linkStrength);

    if (this.forceConfig.centerX > this.forceConfig.centerY) {
      this.simulation
        // Weak X 
        .force("x", forceX<ForceNode>(this.forceConfig.centerX).strength(this.forceConfig.centerStrength * 0.25))
        // Strong Y - organisms are pushed towards a horizontal line. 
        .force("y", forceY<ForceNode>(this.forceConfig.centerY).strength(this.forceConfig.centerStrength));
    } else {
      this.simulation
        // Strong X 
        .force("x", forceX<ForceNode>(this.forceConfig.centerX).strength(this.forceConfig.centerStrength))
        // Weak Y - organisms are pushed towards a vertical line.
        .force("y", forceY<ForceNode>(this.forceConfig.centerY).strength(this.forceConfig.centerStrength * 0.25));
    }


    // Update the charge force with a max distance 
    this.simulation
      .force("link", this.linkForce)
      .force(
        "charge",
        forceManyBody<ForceNode>()
          .strength(this.forceConfig.chargeStrength)
          .distanceMax(this.forceConfig.chargeDistanceMax),
      )
      .force(
        "center",
        forceCenter<ForceNode>(this.forceConfig.centerX, this.forceConfig.centerY).strength(
          this.forceConfig.centerStrength,
        ),
      )
      .force(
        "collide",
        forceCollide<ForceNode>(this.forceConfig.collideRadius).strength(
          this.forceConfig.collideStrength,
        ),
      )
      .alphaDecay(this.forceConfig.alphaDecay)

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

    const arrow = new PermanentArrow(
      this.scene,
      this.uiCamera,
      fromId,
      toId,
      {
        targetOffset: this.forceConfig.arrowTargetOffset,
        color: getRelation(fromId, toId)?.value === 1
          ? 0x064f15
          : 0xed0924,
        thickness: 8,
      },
    );

    this.permanentArrows.set(key, arrow);
    return arrow;
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
      this.selectedOrganism = null;
      return;
    }

    const relation = relationData["value"];

    const arrowColorValue = this.getArrowColorValue();

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

        //finds popup text from data/popuptexts.ts and launches the window
        const textId = getInteractionId(first.organismData.id, second.organismData.id);
        this.scene.scene.launch("PopupScene", { textId });
        this.scoreManager.getMoney();

        this.redrawPermanentArrows();
        this.interactionManager.interactionPulse(second, first);

        this.recalculateLayout();
      }

      else if (relation === -1 && arrowColorValue === false) {
        this.interactions.push({
          from: first.organismData.id,
          to: second.organismData.id,
        });

        //finds popup text from data/popuptexts.ts and launches the window
        const textId = getInteractionId(first.organismData.id, second.organismData.id);
        this.scene.scene.launch("PopupScene", { textId });
        this.scoreManager.getMoney();

        this.redrawPermanentArrows();
        this.interactionManager.interactionPulse(second, first);

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
      const position = this.getSpawnPosition(nextOrganism);
      const created = this.organismManager.createOrganism(
        position.x,
        position.y,
        nextOrganism,
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


  public redrawPermanentArrows(): void {
    const activeOrganisms = this.getActiveOrganisms();

    const organismsById = new Map(
      activeOrganisms.map((organism) => [
        organism.organismData.id,
        organism,
      ]),
    );

    for (const { from, to } of this.interactions) {
      const first =
        organismsById.get(from) ?? this.knownOrganisms.get(from);
      const second =
        organismsById.get(to) ?? this.knownOrganisms.get(to);

      if (!first || !second) continue;

      const key = this.getPermanentArrowKey(from, to);
      const isBidirectional = this.interactions.some(
        (other) => other.from === to && other.to === from,
      );

      const color =
        getRelation(from, to)?.value === 1
          ? 0x064f15
          : 0xed0924;

      let arrow = this.permanentArrows.get(key);

      if (!arrow) {
        arrow = this.createArrow(from, to);
      }

      arrow.setStyle({
        targetOffset: this.forceConfig.arrowTargetOffset,
        color,
        thickness: 8,
        lateralOffset: isBidirectional ? 25 : 0,
      });

      arrow.update(first, second);
    }
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

    drawArrow(this.previewArrow, {
      x1: this.selectedOrganism.x,
      y1: this.selectedOrganism.y,
      x2: targetX,
      y2: targetY,
      color,
      thickness: 2,
      lateralOffset: 0,
    });
  }
}
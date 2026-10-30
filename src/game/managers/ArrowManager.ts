import Phaser from "phaser";
import ArrowButtons from "../entities/arrowbuttons";
import type Organism from "../entities/organism";
import type PermanentArrow from "../entities/permanentarrow";
import { getRelation } from "../services/RelationsService";
import type { Connection } from "../types/Connection";
import InteractionManager from "./InteractionManager";
import ConnectionManager from "./ConnectionManager";
import OrganismManager from "./OrganismManager";
import { ScoreManager } from "./ScoreManager";
import ArrowRenderer from "./ArrowRenderer";
import ForceLayoutManager from "./ForceLayoutManager";
import { getInteractionId } from "../data/popupTexts";
import {
  DEFAULT_FORCE_CONFIG,
  type ForceLayoutConfig,
} from "../config/forceConfig";

export { DEFAULT_FORCE_CONFIG, type ForceLayoutConfig };

export default class ArrowManager {
  private scene: Phaser.Scene;
  private renderer: ArrowRenderer;
  private forceLayout: ForceLayoutManager;

  private interactionManager: InteractionManager;
  private connectionManager: ConnectionManager;
  private organismManager: OrganismManager;
  private scoreManager: ScoreManager;

  private arrowColorValue = true;
  private cursorMode = false;
  private selectedOrganism: Organism | null = null;
  private interactions: Connection[];

  private readonly defaultOrganismSpawnOrder: readonly string[] = [
    "ants",
    "sapota",
    "antfootbacteria",
    "diazotroph",
    "glomeromycetes",
    "mycorrhizahelper",
  ];
  public organismSpawnOrder: string[] = [...this.defaultOrganismSpawnOrder];
  private nextOrganismToSpawn = 0;

  private knownOrganisms = new Map<string, Organism>();
  private draggableOrganisms = new WeakSet<Organism>();

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
    this.renderer = new ArrowRenderer(scene, uiCamera);
    this.interactionManager = interactionManager;
    this.connectionManager = connectionManager;
    this.organismManager = organismManager;
    this.scoreManager = scoreManager;
    this.interactions = interactions;

    this.forceLayout = new ForceLayoutManager(
      scene.scale.width,
      scene.scale.height,
      forceConfig,
    );

    this.recalculateLayout();
    this.redrawPermanentArrows();

    if (import.meta.env?.DEV && typeof window !== "undefined") {
      (window as unknown as Record<string, unknown>).arrowManager = this;
    }
  }

  public getSpawnPosition(id: string): { x: number; y: number } {
    return this.forceLayout.getSpawnPosition(id);
  }

  public playArrowPulseAnimation(
    fromId: string,
    toId: string,
    hpChange: number,
  ): void {
    this.renderer.playPulse(fromId, toId, hpChange);
  }

  public setForceConfig(newConfig: Partial<ForceLayoutConfig>): void {
    this.forceLayout.setConfig(
      newConfig,
      this.getActiveOrganisms(),
      this.interactions,
    );
    this.redrawPermanentArrows();
  }

  public getForceConfig(): ForceLayoutConfig {
    return this.forceLayout.getConfig();
  }

  public recalculateLayout(): void {
    this.forceLayout.recalculate(this.getActiveOrganisms(), this.interactions);
  }

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

  public arrowChecker(organism: Organism): void {
    if (this.cursorMode) return;
    if (this.scene.input?.activePointer?.event?.shiftKey) return;

    this.knownOrganisms.set(organism.organismData.id, organism);
    this.enableDrag(organism);

    if (this.selectedOrganism === null) {
      this.selectedOrganism = organism;
      return;
    }

    const first = this.selectedOrganism;
    const second = organism;
    const firstId = first.organismData.id;
    const secondId = second.organismData.id;
    const relationData = getRelation(firstId, secondId);

    if (firstId === secondId || !relationData) {
      this.clearPreview();
      this.selectedOrganism = null;
      return;
    }

    const relation = relationData.value;
    const arrowColorValue = this.getArrowColorValue();
    const alreadyExists = this.interactions.some(
      (i) => i.from === firstId && i.to === secondId,
    );

    if (!alreadyExists) {
      const isCorrect =
        (relation === 1 && arrowColorValue) ||
        (relation === -1 && !arrowColorValue);

      if (isCorrect) {
        this.interactions.push({ from: firstId, to: secondId });

        const textId = getInteractionId(firstId, secondId);
        this.scene.scene.launch("PopupScene", { textId });
        this.scoreManager.getMoney();

        this.redrawPermanentArrows();
        this.interactionManager.interactionPulse(second, first);
        this.recalculateLayout();
      } else {
        this.scoreManager.loseMoney();
      }
    }

    this.clearPreview();

    console.log(firstId, first.x, first.y, relation);
    console.log(secondId, second.x, second.y, relation);

    const allRelationsCorrect = this.connectionManager.checkConnections();
    const nextOrganism = this.organismSpawnOrder[this.nextOrganismToSpawn];

    if (allRelationsCorrect && nextOrganism) {
      const position = this.getSpawnPosition(nextOrganism);
      const created = this.organismManager.createOrganism(
        position.x,
        position.y,
        nextOrganism,
      ) as Organism | void;

      if (created?.organismData) {
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
    const organismsById = new Map(this.knownOrganisms);
    for (const org of this.getActiveOrganisms()) {
      organismsById.set(org.organismData.id, org);
    }

    this.renderer.redrawPermanentArrows(
      this.interactions,
      organismsById,
      this.forceLayout.getConfig().arrowTargetOffset,
      this.cursorMode,
      (fromId, toId) => {
        const textId = getInteractionId(fromId, toId);
        this.scene.scene.launch("PopupScene", { textId });
      },
    );
  }

  public createArrowButtons(centerY: number): void {
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
      this.setCursorMode(false);
    });

    redButton.on("arrowButtonClicked", () => {
      this.arrowColorValue = false;
      this.setCursorMode(false);
    });
  }

  public setCursorMode(enabled: boolean): void {
    this.cursorMode = enabled;
    this.renderer.setCursorMode(enabled);
  }

  public getArrowColorValue(): boolean {
    return this.arrowColorValue;
  }

  public setArrowColorValue(value: boolean): void {
    this.arrowColorValue = value;
  }

  public clearPreview(): void {
    this.renderer.clearPreview();
    this.selectedOrganism = null;
  }

  public getArrows(): ReadonlyMap<string, PermanentArrow> {
    return this.renderer.getArrows();
  }

  public getArrow(fromId: string, toId: string): PermanentArrow | undefined {
    return this.renderer.getArrow(fromId, toId);
  }

  private enableDrag(organism: Organism): void {
    if (
      this.draggableOrganisms.has(organism) ||
      typeof organism.on !== "function"
    ) {
      return;
    }
    this.draggableOrganisms.add(organism);

    organism.setInteractive?.({ draggable: true });
    this.scene.input?.setDraggable?.(organism);

    organism.on(
      "drag",
      (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        if (!pointer.event.shiftKey) return;

        organism.setPosition(dragX, dragY);
        this.recalculateLayout();
        this.redrawPermanentArrows();
      },
    );
  }

  public update(): void {
    this.forceLayout.step();
    this.redrawPermanentArrows();
    this.renderer.drawPreview(this.selectedOrganism, this.arrowColorValue);
  }
}
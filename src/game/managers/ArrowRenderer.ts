import Phaser from "phaser";
import type Organism from "../entities/organism";
import PermanentArrow from "../entities/permanentarrow";
import { drawArrow } from "../services/DrawArrowService";
import { getRelation } from "../services/RelationsService";
import type { Connection } from "../types/Connection";
import { arrowUIConfig, type ArrowUIConfig } from "../config/uiConfig";

export default class ArrowRenderer {
  private scene: Phaser.Scene;
  private uiCamera: Phaser.Cameras.Scene2D.Camera;
  private config: ArrowUIConfig;
  private permanentArrows = new Map<string, PermanentArrow>();
  private previewArrow: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    uiCamera: Phaser.Cameras.Scene2D.Camera,
    config: ArrowUIConfig = arrowUIConfig,
  ) {
    this.scene = scene;
    this.uiCamera = uiCamera;
    this.config = config;

    this.previewArrow = this.scene.add.graphics();
    this.previewArrow.setDepth(100);
    this.uiCamera.ignore(this.previewArrow);
  }

  private getKey(fromId: string, toId: string): string {
    return JSON.stringify([fromId, toId]);
  }

  private getRelationColor(fromId: string, toId: string): number {
    return getRelation(fromId, toId)?.value === 1
      ? this.config.positiveColor
      : this.config.negativeColor;
  }

  public redrawPermanentArrows(
    interactions: Connection[],
    organismsById: ReadonlyMap<string, Organism>,
    targetOffset: number,
    cursorMode: boolean,
    onArrowClick: (fromId: string, toId: string) => void,
  ): void {
    for (const { from, to } of interactions) {
      const first = organismsById.get(from);
      const second = organismsById.get(to);
      if (!first || !second) continue;

      const key = this.getKey(from, to);
      const isBidirectional = interactions.some(
        (other) => other.from === to && other.to === from,
      );
      const color = this.getRelationColor(from, to);

      let arrow = this.permanentArrows.get(key);
      if (!arrow) {
        arrow = new PermanentArrow(
          this.scene,
          this.uiCamera,
          from,
          to,
          { targetOffset, color, thickness: this.config.permanentThickness },
          () => onArrowClick(from, to),
        );
        arrow.setCursorMode(cursorMode);
        this.permanentArrows.set(key, arrow);
      }

      arrow.setStyle({
        targetOffset,
        color,
        thickness: this.config.permanentThickness,
        lateralOffset: isBidirectional ? this.config.bidirectionalOffset : 0,
      });

      arrow.update(first, second);
    }
  }

  public drawPreview(
    selectedOrganism: Organism | null,
    isPositiveColor: boolean,
  ): void {
    this.previewArrow.clear();
    if (!selectedOrganism) return;

    const pointer = this.scene.input.activePointer;
    const targetX = pointer.worldX ?? pointer.x ?? 0;
    const targetY = pointer.worldY ?? pointer.y ?? 0;

    drawArrow(this.previewArrow, {
      x1: selectedOrganism.x,
      y1: selectedOrganism.y,
      x2: targetX,
      y2: targetY,
      color: isPositiveColor
        ? this.config.positiveColor
        : this.config.negativeColor,
      thickness: this.config.previewThickness,
      lateralOffset: 0,
    });
  }

  public clearPreview(): void {
    this.previewArrow.clear();
  }

  public playPulse(fromId: string, toId: string, hpChange: number): void {
    this.permanentArrows.get(this.getKey(fromId, toId))?.playPulse(hpChange);
  }

  public setCursorMode(enabled: boolean): void {
    for (const arrow of this.permanentArrows.values()) {
      arrow.setCursorMode(enabled);
    }
  }

  public getArrows(): ReadonlyMap<string, PermanentArrow> {
    return this.permanentArrows;
  }

  public getArrow(fromId: string, toId: string): PermanentArrow | undefined {
    return this.permanentArrows.get(this.getKey(fromId, toId));
  }
}
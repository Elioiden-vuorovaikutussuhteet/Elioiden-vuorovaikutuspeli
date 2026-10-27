import Phaser from "phaser";
import type Organism from "./organism";
import { drawArrow } from "../services/DrawArrowService";

export interface PermanentArrowConfig {
  targetOffset?: number;
  color?: number;
  thickness?: number;
  lateralOffset?: number;
}

interface PulseAnimation {
  circle: Phaser.GameObjects.Arc;
  progress: number;
  tween: Phaser.Tweens.Tween;
}

export default class PermanentArrow {
  public readonly key: string;
	public readonly fromId: string;
  public readonly toId: string;
  public readonly graphics: Phaser.GameObjects.Graphics;

  private readonly scene: Phaser.Scene;
  private readonly uiCamera: Phaser.Cameras.Scene2D.Camera;
  private readonly hitZone: Phaser.GameObjects.Zone;
  private readonly onClicked: () => void;

  private targetOffset: number;
  private color: number;
  private thickness: number;
  private lateralOffset: number;

  private pulses: PulseAnimation[] = [];

	private fromX = 0;
	private fromY = 0;
	private toX = 0;
	private toY = 0;
  private hitBounds = new Phaser.Geom.Rectangle();

  constructor(
    scene: Phaser.Scene,
    uiCamera: Phaser.Cameras.Scene2D.Camera,
    fromId: string,
    toId: string,
    config: PermanentArrowConfig = {},
    onClicked: () => void = () => undefined,
  ) {
    this.scene = scene;
    this.uiCamera = uiCamera;
    this.onClicked = onClicked;

    this.fromId = fromId;
    this.toId = toId;
    this.key = JSON.stringify([fromId, toId]);

    this.targetOffset = config.targetOffset ?? 65;
    this.color = config.color ?? 0x064f15;
    this.thickness = config.thickness ?? 8;
    this.lateralOffset = config.lateralOffset ?? 0;

    this.graphics = this.scene.add.graphics();
    this.graphics.setDepth(100);
    this.uiCamera.ignore(this.graphics);
    
    //arrow hitzone for cursormode
    this.hitZone = this.scene.add.zone(0, 0, 1, 1);
    this.hitZone.setOrigin(0);
    this.hitZone.setDepth(99);
    this.hitZone.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, 1, 1),
      (_hitArea, x, y) => this.isPointOnArrow(x + this.hitBounds.x, y + this.hitBounds.y),
    );
    this.hitZone.on("pointerdown", () => this.onClicked());
    this.hitZone.input!.enabled = false;
    this.uiCamera.ignore(this.hitZone);
  }

  public setStyle(config: Partial<PermanentArrowConfig>): void {
    if (config.targetOffset !== undefined) {
      this.targetOffset = config.targetOffset;
    }
    if (config.color !== undefined) {
      this.color = config.color;
    }
    if (config.thickness !== undefined) {
      this.thickness = config.thickness;
    }
    if (config.lateralOffset !== undefined) {
      this.lateralOffset = config.lateralOffset;
    }
  }
	
  public playPulse(healthChange: number): void {
    const color = healthChange >= 0 ? 0x04B504 : 0xb83232;

    const circle = this.scene.add.circle(
      this.fromX,
      this.fromY,
      8,
      color,
    );

    circle.setDepth(101);
    circle.setAlpha(0.8);
    this.uiCamera.ignore(circle);

    const pulse: PulseAnimation = {
      circle,
      progress: 0,
      tween: undefined as unknown as Phaser.Tweens.Tween,
    };

    pulse.tween = this.scene.tweens.add({
      targets: pulse,
      progress: 1,
      duration: 1000,
      ease: "Linear",
      onComplete: () => {
        circle.destroy();
        this.pulses = this.pulses.filter((p) => p !== pulse);
      },
    });

    this.pulses.push(pulse);
  }

  private updatePulsePosition(): void {
    for (const pulse of this.pulses) {
      const t = pulse.progress;

      pulse.circle.setPosition(
        this.fromX + (this.toX - this.fromX) * t,
        this.fromY + (this.toY - this.fromY) * t,
      );
    }
  }


  public update(from: Organism, to: Organism): void {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy);
    
    this.graphics.clear();
    if (distance === 0) return;

    const targetX = to.x - (dx / distance) * this.targetOffset;
    const targetY = to.y - (dy / distance) * this.targetOffset;

    const ux = dx / distance;
    const uy = dy / distance;
    const px = -uy;
    const py = ux;

    // values used for animation
    this.fromX = from.x + px * this.lateralOffset;
    this.fromY = from.y + py * this.lateralOffset;
    this.toX = targetX + px * this.lateralOffset;
    this.toY = targetY + py * this.lateralOffset;

    this.updateHitZone();
    drawArrow(this.graphics, {
        x1: from.x,
        y1: from.y,
        x2: targetX,
        y2: targetY,
        color: this.color,
        thickness: this.thickness,
        lateralOffset: this.lateralOffset,
    });

    this.updatePulsePosition();
  }

  public setCursorMode(enabled: boolean): void {
    this.hitZone.input!.enabled = enabled;
  }

  private updateHitZone(): void {
    const padding = this.thickness + 12;
    const minX = Math.min(this.fromX, this.toX) - padding;
    const minY = Math.min(this.fromY, this.toY) - padding;
    const width = Math.max(1, Math.abs(this.toX - this.fromX) + padding * 2);
    const height = Math.max(1, Math.abs(this.toY - this.fromY) + padding * 2);

    this.hitBounds.setTo(minX, minY, width, height);
    this.hitZone.setPosition(minX, minY);
    this.hitZone.setSize(width, height);
    this.hitZone.input!.hitArea = new Phaser.Geom.Rectangle(0, 0, width, height);
  }

  private isPointOnArrow(x: number, y: number): boolean {
    const dx = this.toX - this.fromX;
    const dy = this.toY - this.fromY;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) return false;

    const projection = Math.max(
      0,
      Math.min(1, ((x - this.fromX) * dx + (y - this.fromY) * dy) / lengthSquared),
    );
    const closestX = this.fromX + projection * dx;
    const closestY = this.fromY + projection * dy;

    return Math.hypot(x - closestX, y - closestY) <= this.thickness + 8;
  }

  public destroy(): void {
    for (const pulse of this.pulses) {
      pulse.tween.stop();
      pulse.circle.destroy();
    }

    this.pulses = [];

    this.graphics.destroy();
    this.hitZone.destroy();
  }
}

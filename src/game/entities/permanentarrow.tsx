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

  private targetOffset: number;
  private color: number;
  private thickness: number;
  private lateralOffset: number;

  private pulses: PulseAnimation[] = [];

	private fromX = 0;
	private fromY = 0;
	private toX = 0;
	private toY = 0;

  constructor(
    scene: Phaser.Scene,
    uiCamera: Phaser.Cameras.Scene2D.Camera,
    fromId: string,
    toId: string,
    config: PermanentArrowConfig = {},
  ) {
    this.scene = scene;
    this.uiCamera = uiCamera;

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

  public destroy(): void {
    for (const pulse of this.pulses) {
      pulse.tween.stop();
      pulse.circle.destroy();
    }

    this.pulses = [];

    this.graphics.destroy();
  }
}

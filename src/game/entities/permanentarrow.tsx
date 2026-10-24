import Phaser from "phaser";
import type Organism from "./organism";

export interface PermanentArrowConfig {
  targetOffset?: number;
  color?: number;
  thickness?: number;
  lateralOffset?: number;
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

	private pulse!: Phaser.GameObjects.Arc;
	private pulseProgress = 0;
	private pulseTween?: Phaser.Tweens.Tween;

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

		this.pulse = this.scene.add.circle(
			0,
			0,
			8,
			0xffff66,
		);

		this.pulse.setDepth(101);
		this.pulse.setVisible(false);
		this.uiCamera.ignore(this.pulse);
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
	
	public playPulse(): void {
		this.pulseTween?.stop();

		this.pulseProgress = 0;
		this.pulse.setVisible(true);

		this.pulseTween = this.scene.tweens.add({
			targets: this,
			pulseProgress: 1,
			duration: 700,
			ease: "Linear",
			onComplete: () => {
				this.pulse.setVisible(false);
				this.pulseTween = undefined;
			},
		});
	}

		private updatePulsePosition(): void {
		if (!this.pulse.visible) return;

		const t = this.pulseProgress;

		this.pulse.setPosition(
			this.fromX + (this.toX - this.fromX) * t,
			this.fromY + (this.toY - this.fromY) * t,
		);
	}

  public update(from: Organism, to: Organism): void {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy);

    this.graphics.clear();

    if (distance === 0) return;

    const targetX = to.x - (dx / distance) * this.targetOffset;
    const targetY = to.y - (dy / distance) * this.targetOffset;

    this.draw(
      from.x,
      from.y,
      targetX,
      targetY,
    );

		this.updatePulsePosition();
  }

  private draw(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy);

    if (length === 0) return;

    const ux = dx / length;
    const uy = dy / length;
    const px = -uy;
    const py = ux;

    const sx1 = x1 + px * this.lateralOffset;
    const sy1 = y1 + py * this.lateralOffset;
    const sx2 = x2 + px * this.lateralOffset;
    const sy2 = y2 + py * this.lateralOffset;

    const x3 = sx2 - 20 * ux + 15 * px;
    const y3 = sy2 - 20 * uy + 15 * py;
    const x4 = sx2 - 20 * ux - 15 * px;
    const y4 = sy2 - 20 * uy - 15 * py;

    this.graphics.lineStyle(this.thickness, this.color);
    this.graphics.fillStyle(this.color, 1);

    this.graphics.lineBetween(
      sx1, sy1,
      sx2 - 15 * ux,
      sy2 - 15 * uy,
    );

    this.graphics.fillTriangle(sx2, sy2, x3, y3, x4, y4);
  }

  public destroy(): void {
    this.graphics.destroy();
  }
}

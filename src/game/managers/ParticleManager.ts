import Phaser from "phaser";
import {
  particleConfig,
  type EmitterVariantConfig,
  type ParticleConfig,
} from "../config/particleConfig";

export default class ParticleManager {
  private positiveEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
  private negativeEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
  private config: ParticleConfig;

  constructor(
    scene: Phaser.Scene,
    uiCamera: Phaser.Cameras.Scene2D.Camera,
    config: ParticleConfig = particleConfig,
  ) {
    this.config = config;

    this.positiveEmitter = this.createEmitter(scene, this.config.positive);
    this.negativeEmitter = this.createEmitter(scene, this.config.negative);

    uiCamera.ignore([this.positiveEmitter, this.negativeEmitter]);
  }

  private createEmitter(
    scene: Phaser.Scene,
    variant: EmitterVariantConfig,
  ): Phaser.GameObjects.Particles.ParticleEmitter {
    const { x1, y1, x2, y2 } = this.config.emitLine;

    const emitter = scene.add.particles(0, 0, variant.texture, {
      emitting: false,
      tint: variant.tint,
      emitZone: {
        type: "edge",
        source: new Phaser.Geom.Line(x1, y1, x2, y2),
        quantity: this.config.emitZoneQuantity,
      },
      speedX: this.config.speedX,
      speedY: variant.speedY,
      scale: this.config.scale,
      alpha: this.config.alpha,
      lifespan: this.config.lifespan,
      quantity: this.config.quantity,
    });

    emitter.setDepth(this.config.depth);
    return emitter;
  }

  public healthChanged(x: number, y: number, amount: number): void {
    if (amount > 0) {
      this.positiveEmitter.explode(this.config.explodeCount, x, y);
    } else if (amount < 0) {
      this.negativeEmitter.explode(this.config.explodeCount, x, y);
    }
  }

  public destroy(): void {
    this.positiveEmitter.destroy();
    this.negativeEmitter.destroy();
  }
}
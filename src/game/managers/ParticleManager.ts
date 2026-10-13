import Phaser from "phaser";

export default class ParticleManager {
  private positiveEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
  private negativeEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, uiCamera: Phaser.Cameras.Scene2D.Camera,) {
    this.positiveEmitter = scene.add.particles(0, 0, "pos_particle", {
        emitting: false,
        tint: 0x48AB1D,
      
        emitZone: {
          type: "edge",
          source: new Phaser.Geom.Line(-50, 0, 50, 0),
          quantity: 4,
        },
        speedX: 0,
        speedY: { min: -180, max: -80 },
      
        scale: { start: 0.05, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 1500,
      
        quantity: 1,
      });
      
      this.negativeEmitter = scene.add.particles(0, 0, "neg_particle", {
        emitting: false,
        tint: 0x8F1C00,
      
        emitZone: {
          type: "edge",
          source: new Phaser.Geom.Line(-50, 0, 50, 0),
          quantity: 4,
        },
        speedX: 0,
        speedY: { min: 80, max: 180 },
      
        scale: { start: 0.05, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 1500,
      
        quantity: 1,
      });

      uiCamera.ignore([
        this.positiveEmitter,
        this.negativeEmitter,
      ]);
      
      this.positiveEmitter.setDepth(1000);
      this.negativeEmitter.setDepth(1000);
  }

  public healthChanged(x: number, y: number, amount: number) {
    if (amount > 0) {
      this.positiveEmitter.explode(4, x, y);
    } else if (amount < 0) {
      this.negativeEmitter.explode(4, x, y);
    }
  }

  public destroy() {
    this.positiveEmitter.destroy();
    this.negativeEmitter.destroy();
  }
}
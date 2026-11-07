import Phaser from "phaser";
import Organism from "../entities/organism";
import { 
  glowConfig,
  type GlowConfig 
} from "../config/particleConfig"

export default class ParticleManager {
  private scene: Phaser.Scene;
  private activeGlows = new Map<
    Organism,
    {
      glows: Phaser.Filters.Glow[],
      tweens: Phaser.Tweens.Tween[];}
  >();
  private config: GlowConfig;

  constructor(
    scene: Phaser.Scene,
    config: GlowConfig = glowConfig,
  ) {
    this.scene = scene;
    this.config = config;
  }

  public healthChanged(organism: Organism, amount: number,): void {
    if (amount === 0) return;

    this.removeGlow(organism);

    organism.enableFilters();
    organism.duplicateContainer.enableFilters();

    const color = amount > 0 ? this.config.positiveGlow : this.config.negativeGlow;

    const glow = organism.filters!.external.addGlow(color);
    glow.setPaddingOverride(null);
    const duplicateGlow =
      organism.duplicateContainer.filters!.external.addGlow(color);
    duplicateGlow.setPaddingOverride(null);

    const whiteGlow = organism.filters!.internal.addGlow(this.config.whiteGlow)
    whiteGlow.setPaddingOverride(null);
    const duplicateWhiteGlow =
      organism.duplicateContainer.filters!.internal.addGlow(this.config.whiteGlow);
    duplicateWhiteGlow.setPaddingOverride(null);

    const outerTween = this.scene.tweens.add({
      targets: [glow, duplicateGlow],
      outerStrength: this.config.outerOuterStrength,
      duration: this.config.outerDuration,
      yoyo: true,
      loop: this.config.loop,
      ease:"Sine.inOut",
      onComplete: () => {
      this.removeGlow(organism);
    }
  });

    const innerTween = this.scene.tweens.add({
      targets: [whiteGlow, duplicateWhiteGlow],
      outerStrength: this.config.innerOuterStrength,
      duration: this.config.innerDuration,
      yoyo: true,
      loop: this.config.loop,
      ease: "Sine.inOut",
      onComplete: () => {
        this.removeGlow(organism);
    }});

    this.activeGlows.set(organism, {
      glows: [glow, duplicateGlow, whiteGlow, duplicateWhiteGlow],
      tweens: [outerTween, innerTween],
    });
  }

  private removeGlow(organism: Organism): void {
    const active = this.activeGlows.get(organism);
    if (!active) return;

    active.tweens.forEach((tween) => tween.stop());
    active.glows.forEach((glow) => glow.destroy());

    this.activeGlows.delete(organism);
  }

  public destroy(): void {
    this.activeGlows.forEach(({ glows, tweens }) => {
      tweens.forEach((tween) => tween.stop());
      glows.forEach((glow) => glow.destroy());
    });
    this.activeGlows.clear();
  }
}

//import Phaser from "phaser";
//import {
//  particleConfig,
//  type EmitterVariantConfig,
//  type ParticleConfig,
//} from "../config/particleConfig";

//export default class ParticleManager {
//  private positiveEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
//  private negativeEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
//  private config: ParticleConfig;

//  constructor(
//    scene: Phaser.Scene,
//    uiCamera: Phaser.Cameras.Scene2D.Camera,
//    config: ParticleConfig = particleConfig,
//  ) {
//  this.config = config;

//    this.positiveEmitter = this.createEmitter(scene, this.config.positive);
//    this.negativeEmitter = this.createEmitter(scene, this.config.negative);

//    uiCamera.ignore([this.positiveEmitter, this.negativeEmitter]);
//  }

//  private createEmitter(
//    scene: Phaser.Scene,
//    variant: EmitterVariantConfig,
//  ): Phaser.GameObjects.Particles.ParticleEmitter {
//    const { x1, y1, x2, y2 } = this.config.emitLine;

//    const emitter = scene.add.particles(0, 0, variant.texture, {
//      emitting: false,
//      tint: variant.tint,
//      emitZone: {
//        type: "random",
//        source: new Phaser.Geom.Line(x1, y1, x2, y2),
//        quantity: this.config.emitZoneQuantity,
//      },
//      speedX: this.config.speedX,
//      speedY: variant.speedY,
//      scale: this.config.scale,
//      alpha: this.config.alpha,
//      lifespan: this.config.lifespan,
//      quantity: this.config.quantity,
//    });

//    emitter.setDepth(this.config.depth);
//    return emitter;
//  }

//  public healthChanged(x: number, y: number, amount: number): void {
//    if (amount > 0) {
//      this.positiveEmitter.explode(this.config.explodeCount, x, y);
//    } else if (amount < 0) {
//      this.negativeEmitter.explode(this.config.explodeCount, x, y);
//    }
//  }

//  public destroy(): void {
//    this.positiveEmitter.destroy();
//    this.negativeEmitter.destroy();
//  }
//}

import Phaser from "phaser";
import Organism from "../entities/organism";
import { glowConfig, type GlowConfig } from "../config";

export default class GlowManager {
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
    const duplicateGlow = organism.duplicateContainer.filters!.external.addGlow(color);
    duplicateGlow.setPaddingOverride(null);

    const whiteGlow = organism.filters!.internal.addGlow(this.config.whiteGlow)
    whiteGlow.setPaddingOverride(null);
    const duplicateWhiteGlow = organism.duplicateContainer.filters!.internal.addGlow(this.config.whiteGlow);
    duplicateWhiteGlow.setPaddingOverride(null);

    const outerGlow = this.scene.tweens.add({
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

    const innerGlow = this.scene.tweens.add({
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
      tweens: [outerGlow, innerGlow],
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

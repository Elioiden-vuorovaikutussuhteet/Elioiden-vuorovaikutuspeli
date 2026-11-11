import Phaser from "phaser";
import Organism from "../entities/organism";
import { glowConfig, type GlowConfig } from "../config";

export default class GlowManager {
  private scene: Phaser.Scene;
  private activeGlows = new Map<
    Organism,
    {
      glows: Phaser.Filters.Glow[];
      tweens: Phaser.Tweens.Tween[];
    }
  >();
  private config: GlowConfig;

  constructor(scene: Phaser.Scene, config: GlowConfig = glowConfig) {
    this.scene = scene;
    this.config = config;
  }

  public healthChanged(organism: Organism, amount: number): void {
    if (amount === 0) return;

    const color =
      amount > 0 ? this.config.positiveGlow : this.config.negativeGlow;

    const existing = this.activeGlows.get(organism);
    if (existing) {
      existing.glows[0].color = color;
      existing.glows[1].color = color;
      existing.tweens.forEach((tween) => tween.restart());
      return;
    }

    if (!organism.filters) {
      organism.enableFilters();
    }
    if (!organism.duplicateContainer.filters) {
      organism.duplicateContainer.enableFilters();
    }

    const whiteGlow = organism.filters!.internal.addGlow(
      this.config.whiteGlow,
      undefined,
      undefined,
      undefined,
      undefined,
      this.config.glowQuality,
    );
    whiteGlow.setPaddingOverride(null);

    const duplicateWhiteGlow =
      organism.duplicateContainer.filters!.internal.addGlow(
        this.config.whiteGlow,
        undefined,
        undefined,
        undefined,
        undefined,
        this.config.glowQuality,
      );
    duplicateWhiteGlow.setPaddingOverride(null);

    const glow = organism.filters!.internal.addGlow(
      color,
      undefined,
      undefined,
      undefined,
      undefined,
      this.config.glowQuality,
    );
    glow.setPaddingOverride(null);

    const duplicateGlow = organism.duplicateContainer.filters!.internal.addGlow(
      color,
      undefined,
      undefined,
      undefined,
      undefined,
      this.config.glowQuality,
    );
    duplicateGlow.setPaddingOverride(null);

    const isOuterLonger =
      this.config.outerDuration >= this.config.innerDuration;

    const outerGlow = this.scene.tweens.add({
      targets: [glow, duplicateGlow],
      outerStrength: this.config.outerOuterStrength,
      duration: this.config.outerDuration,
      yoyo: true,
      loop: this.config.loop,
      ease: "Sine.inOut",
      onComplete: isOuterLonger ? () => this.removeGlow(organism) : undefined,
    });

    const innerGlow = this.scene.tweens.add({
      targets: [whiteGlow, duplicateWhiteGlow],
      outerStrength: this.config.innerOuterStrength,
      duration: this.config.innerDuration,
      yoyo: true,
      loop: this.config.loop,
      ease: "Sine.inOut",
      onComplete: !isOuterLonger ? () => this.removeGlow(organism) : undefined,
    });

    this.activeGlows.set(organism, {
      glows: [glow, duplicateGlow, whiteGlow, duplicateWhiteGlow],
      tweens: [outerGlow, innerGlow],
    });
  }

  private removeGlow(organism: Organism): void {
    const active = this.activeGlows.get(organism);
    if (!active) return;

    active.tweens.forEach((tween) => tween.stop());

    const [glow, duplicateGlow, whiteGlow, duplicateWhiteGlow] = active.glows;

    organism.filters?.internal.remove?.(glow);
    organism.filters?.internal.remove?.(whiteGlow);
    organism.duplicateContainer.filters?.internal.remove?.(duplicateGlow);
    organism.duplicateContainer.filters?.internal.remove?.(duplicateWhiteGlow);

    active.glows.forEach((g) => g.destroy());

    this.activeGlows.delete(organism);
  }

  public destroy(): void {
    for (const organism of this.activeGlows.keys()) {
      this.removeGlow(organism);
    }
  }
}

import Phaser from "phaser";
import Organism from "../entities/organism";
import { glowConfig, type GlowConfig } from "../config";

type GlowPair = {
  glow: Phaser.Filters.Glow;
  duplicateGlow: Phaser.Filters.Glow;
};

interface OverallGlow {
  outer: GlowPair;
  inner: GlowPair;
  tweens: Phaser.Tweens.Tween[];
}

interface PulseGlow {
  pair: GlowPair;
  tween: Phaser.Tweens.Tween;
}

interface GlowState {
  initialHP: number;
  currentHP: number;
  overall: OverallGlow;
  pulse?: PulseGlow;
}

export default class GlowManager {
  private scene: Phaser.Scene;
  private states = new Map<Organism, GlowState>();
  private config: GlowConfig;

  constructor(scene: Phaser.Scene, config: GlowConfig = glowConfig) {
    this.scene = scene;
    this.config = config;
  }

  public healthChanged(
    organism: Organism,
    amount: number,
    initialHP: number,
  ): void {
    if (amount === 0) return;

    let state = this.states.get(organism);

    if (!state) {
      state = {
        initialHP,
        currentHP: initialHP,
        overall: this.createOverall(organism),
      };
      this.states.set(organism, state);
    } else if (state.initialHP !== initialHP) {
      state.initialHP = initialHP;
      state.currentHP = initialHP;
    }

    state.currentHP += amount;

    this.updateOverall(state);
    this.playPulse(organism, state, amount);
  }

  public removeGlow(organism: Organism): void {
    const state = this.states.get(organism);
    if (!state) return;

    this.removePulse(organism);

    state.overall.tweens.forEach((t) => t.stop());

    state.overall.outer.glow.outerStrength = 0;
    state.overall.outer.duplicateGlow.outerStrength = 0;

    state.overall.inner.glow.outerStrength = 0;
    state.overall.inner.duplicateGlow.outerStrength = 0;

    this.removePair(organism, state.overall.outer);
    this.removePair(organism, state.overall.inner);

    this.states.delete(organism);
  }

  public clearAll(): void {
    for (const organism of [...this.states.keys()]) {
      this.removeGlow(organism);
    }
  }

  public destroy(): void {
    this.clearAll();
  }

  private createOverall(organism: Organism): OverallGlow {
    const inner = this.addGlowPair(organism, this.config.whiteGlow);
    const outer = this.addGlowPair(organism, this.config.whiteGlow);
    return { outer, inner, tweens: [] };
  }

  private updateOverall(state: GlowState): void {
    const { outer, inner } = state.overall;
    const delta = state.currentHP - state.initialHP;
    const hasChange = delta !== 0;

    const color = this.getOverallColor(state.initialHP, delta);
    outer.glow.color = color;
    outer.duplicateGlow.color = color;

    state.overall.tweens.forEach((t) => t.stop());
    state.overall.tweens = [
      this.scene.tweens.add({
        targets: [outer.glow, outer.duplicateGlow],
        outerStrength: hasChange ? this.config.outerOuterStrength : 0,
        duration: this.config.easeInDuration,
        ease: "Sine.inOut",
      }),
      this.scene.tweens.add({
        targets: [inner.glow, inner.duplicateGlow],
        outerStrength: hasChange ? this.config.innerOuterStrength : 0,
        duration: this.config.easeInDuration,
        ease: "Sine.inOut",
      }),
    ];
  }

  private getOverallColor(initialHP: number, delta: number): number {
    const target =
      delta >= 0 ? this.config.positiveGlow : this.config.negativeGlow;

    const ratio = initialHP > 0 ? Math.min(Math.abs(delta) / initialHP, 1) : 1;
    const mix = Phaser.Math.Linear(this.config.minColorMix, 1, ratio);

    const c = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.IntegerToColor(this.config.whiteGlow),
      Phaser.Display.Color.IntegerToColor(target),
      100,
      mix * 100,
    );
    return Phaser.Display.Color.GetColor(c.r, c.g, c.b);
  }

  private playPulse(organism: Organism, state: GlowState, amount: number): void {
    const color =
      amount > 0 ? this.config.positiveGlow : this.config.negativeGlow;

    state.pulse?.tween.stop();
    const pair = state.pulse?.pair ?? this.addGlowPair(organism, color);

    pair.glow.color = color;
    pair.duplicateGlow.color = color;
    pair.glow.outerStrength = 0;
    pair.duplicateGlow.outerStrength = 0;

    const tween = this.scene.tweens.add({
      targets: [pair.glow, pair.duplicateGlow],
      outerStrength: this.config.pulseStrength,
      duration: this.config.pulseDuration / 2,
      yoyo: true,
      ease: "Sine.inOut",
      onComplete: () => this.removePulse(organism),
    });

    state.pulse = { pair, tween };
  }

  private removePulse(organism: Organism): void {
    const state = this.states.get(organism);
    if (!state?.pulse) return;

    state.pulse.tween.stop();
    this.removePair(organism, state.pulse.pair);
    state.pulse = undefined;
  }

  private addGlowPair(organism: Organism, color: number): GlowPair {
    if (!organism.filters) organism.enableFilters();
    if (!organism.duplicateContainer.filters) {
      organism.duplicateContainer.enableFilters();
    }

    const glow = organism.filters!.internal.addGlow(
      color, 0, undefined, undefined, undefined, this.config.glowQuality,
    );
    glow.setPaddingOverride(null);

    const duplicateGlow = organism.duplicateContainer.filters!.internal.addGlow(
      color, 0, undefined, undefined, undefined, this.config.glowQuality,
    );
    duplicateGlow.setPaddingOverride(null);

    return { glow, duplicateGlow };
  }

  private removePair(organism: Organism, pair: GlowPair): void {
    organism.filters?.internal.remove?.(pair.glow);
    organism.duplicateContainer.filters?.internal.remove?.(pair.duplicateGlow);
    pair.glow.destroy();
    pair.duplicateGlow.destroy();
  }
}
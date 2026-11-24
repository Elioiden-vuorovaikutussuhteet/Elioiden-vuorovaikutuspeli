import Phaser from "phaser";

import { lightningConfig, type LightningConfig } from "../config/lightningConfig";

export class LightningScene extends Phaser.Scene {
  private stormClouds: Phaser.GameObjects.Sprite[] = [];
  private config: LightningConfig;
  private lightningEffects?: () => void;

  constructor(config?: Partial<LightningConfig>) {
    const resolvedConfig = { ...lightningConfig, ...config };
    super({ key: resolvedConfig.key });
    this.config = resolvedConfig;
  }

  preload() {
    this.load.image(
      this.config.textureKey,
      `assets/${this.config.textureFile}`,
    );
  }

  create() {
    this.showStormCover();
  }

  init(data?: { lightningEffects?: () => void }): void {
    this.lightningEffects = data?.lightningEffects;
  }

  private showStormCover(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    this.stormClouds = [];

    const overlay = this.add
      .graphics()
      .setDepth(this.config.overlayDepth)
      .setScrollFactor(this.config.overlayScrollFactor);


    overlay.fillStyle(this.config.overlayColor, this.config.overlayBackgroundAlpha);
    overlay.fillRect(this.config.overlayX, this.config.overlayY, width, height);

    this.tweens.add({
      targets: overlay,
      alpha: this.config.overlayTweenAlpha,
      duration: this.config.overlayTweenDuration,
      ease: "Sine.easeOut",
    });

    const cloudWidth = this.config.cloudWidth;
    const cloudHeight = this.config.cloudHeight;
    const targetY = height * this.config.cloudTargetYRatio;

    const leftCloud = this.add
      .sprite(-cloudWidth / 2, targetY, this.config.textureKey)
      .setDepth(this.config.cloudDepth)
      .setScrollFactor(0)
      .setOrigin(0.5)
      .setDisplaySize(cloudWidth, cloudHeight)
      .setAlpha(this.config.cloudAlpha);

    const rightCloud = this.add
      .sprite(width + cloudWidth / 2, targetY, this.config.textureKey)
      .setDepth(this.config.cloudDepth)
      .setScrollFactor(0)
      .setOrigin(0.5)
      .setDisplaySize(cloudWidth, cloudHeight)
      .setAlpha(this.config.cloudAlpha);

    this.stormClouds.push(leftCloud, rightCloud);

    this.tweens.add({
      targets: leftCloud,
      x: width * this.config.leftTargetXRatio,
      alpha: this.config.cloudAlpha,
      duration: this.config.cloudMoveDuration,
      ease: this.config.cloudMoveEase,
    });

    this.tweens.add({
      targets: rightCloud,
      x: width * this.config.rightTargetXRatio,
      alpha: this.config.cloudAlpha,
      duration: this.config.cloudMoveDuration,
      ease: this.config.cloudMoveEase,
    });

    this.time.delayedCall(this.config.lightningDelay, () => {
      this.createLightning();
      this.cameras.main.flash(
        this.config.lightningFlashDuration,
        255,
        255,
        255,
      );
    });

    const effectDelayMs =
      this.config.effectDelayMs ?? this.config.EffectDelayMs ?? 0;
    this.time.delayedCall(effectDelayMs, () => {
      this.lightningEffects?.();
      this.lightningEffects = undefined;
    });

    this.time.delayedCall(this.config.sceneDuration, () => {
      this.tweens.add({
        targets: overlay,
        alpha: 0,
        duration: this.config.fadeDuration,
        ease: "Sine.easeIn",
        onComplete: () => {
          overlay.destroy();
          this.scene.stop();
          this.scene.resume(this.config.returnSceneKey);
        },
      });

      for (const cloud of this.stormClouds) {
        this.tweens.add({
          targets: cloud,
          alpha: 0,
          duration: this.config.cloudFadeDuration,
          ease: "Sine.easeIn",
          onComplete: () => cloud.destroy(),
        });
      }
    });
  }

  private createLightning(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const startX = width * (0.35 + Math.random() * 0.3);
    const startY = height * this.config.lightningStartYRatio;
    const endY = height * this.config.lightningEndYRatio;

    const lightning = this.add
      .graphics()
      .setDepth(this.config.lightningDepth)
      .setScrollFactor(0)
      .setAlpha(1);

    lightning.lineStyle(
      this.config.lightningWidth,
      this.config.lightningColor,
      1,
    );
    lightning.lineBetween(startX, startY, startX - 25, startY + 120);

    let previousX = startX - 25;
    let previousY = startY + 120;

    for (
      let y = startY + 175;
      y < endY;
      y += this.config.lightningStep
    ) {
      const nextX =
        previousX +
        Phaser.Math.Between(
          -this.config.lightningJitter,
          this.config.lightningJitter,
        );
      lightning.lineBetween(previousX, previousY, nextX, y);
      previousX = nextX;
      previousY = y;
    }

    lightning.lineBetween(previousX, previousY, startX + 10, endY);

    this.tweens.add({
      targets: lightning,
      alpha: 0,
      duration: this.config.lightningDuration,
      ease: "Sine.easeOut",
      onComplete: () => lightning.destroy(),
    });
  }
}
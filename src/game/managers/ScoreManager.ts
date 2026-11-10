import Phaser from "phaser";

import { scoreConfig, type ScoreConfig } from "../config/scoreConfig";

export class ScoreManager {
  private scene: Phaser.Scene;
  public money: number;
  private moneyText: Phaser.GameObjects.Text;
  private coinIcon?: Phaser.GameObjects.Image;
  public outOfMoney?: () => void;
  private config: ScoreConfig;

  constructor(
    scene: Phaser.Scene,
    startingMoney: number,
    config: ScoreConfig = scoreConfig,
  ) {
    this.scene = scene;
    this.money = startingMoney;
    this.config = config;

    const scoreX = (scene.scale?.width ?? 800) - this.config.textX;

    this.moneyText = scene.add.text(
      scoreX,
      this.config.textY,
      this.money.toString(),
      {
        fontSize: this.config.fontSize,
        color: this.config.fontColor,
        fontStyle: this.config.fontStyle,
      },
    );

    this.scene.cameras.main.ignore(this.moneyText);

    const coinIcon = scene.add.image?.(
      scoreX,
      this.config.textY + this.config.coin.yOffset,
      this.config.coin.texture,
    );

    if (coinIcon) {
      this.coinIcon = coinIcon;
      this.coinIcon.setOrigin?.(
        this.config.coin.originX,
        this.config.coin.originY,
      );
      this.coinIcon.setScale?.(this.config.coin.scale);

      this.updateCoinPosition();
      this.scene.cameras.main.ignore(this.coinIcon);
    }
  }

  getMoney(): void {
    this.money += this.config.gainAmount;
    this.updateText();
    this.showMoneyChange(this.config.gainAmount);
  }

  loseMoney(amount = this.config.defaultLoseAmount): void {
    this.money -= amount;

    if (this.money <= this.config.minMoney) {
      this.money = this.config.minMoney;
      this.outOfMoney?.();
    }

    this.updateText();
    this.showMoneyChange(-amount);
  }

  private showMoneyChange(amount: number): void {
    if (typeof this.scene.tweens?.add !== "function") return;

    const isGain = amount > this.config.change.gainThreshold;

    const scoreX =
      this.moneyText.x ?? (this.scene.scale?.width ?? 800) - this.config.textX;

    const changeText = this.scene.add.text(
      scoreX + this.config.change.xOffset,
      this.config.textY + this.config.change.startYOffset,
      isGain
        ? `${this.config.change.positivePrefix}${amount}`
        : String(amount),
      {
        fontSize: this.config.change.fontSize,
        color: isGain
          ? this.config.change.gainColor
          : this.config.change.lossColor,
        fontStyle: this.config.change.fontStyle,
      },
    );

    this.scene.cameras.main.ignore(changeText);

    this.scene.tweens.add({
      targets: changeText,
      y:
        this.config.textY +
        (isGain
          ? this.config.change.gainEndYOffset
          : this.config.change.lossEndYOffset),
      alpha: this.config.change.endAlpha,
      duration: this.config.change.duration,
      ease: this.config.change.ease,
      onComplete: () => changeText.destroy(),
    });
  }

  private updateCoinPosition(): void {
    this.coinIcon?.setX(
      this.moneyText.x +
        (this.moneyText.width ?? this.config.coin.fallbackTextWidth) +
        this.config.coin.gap,
    );
  }

  private updateText(): void {
    this.moneyText.setText(this.money.toString());
    this.updateCoinPosition();
  }
}
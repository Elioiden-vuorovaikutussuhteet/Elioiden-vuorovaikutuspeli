import Phaser from "phaser";
import { scoreConfig, type ScoreConfig } from "../config";

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

    this.moneyText = scene.add.text(
      this.config.textX,
      this.config.textY,
      this.money.toString(),
      {
        fontSize: this.config.fontSize,
        color: this.config.fontColor,
        fontStyle: this.config.fontStyle,
      },
    );
    this.scene.cameras.main.ignore(this.moneyText);

    const coinIcon = scene.add.image?.(0, this.config.textY + 15, "coin");
    if (coinIcon) {
      this.coinIcon = coinIcon;
      this.coinIcon.setOrigin?.(0, 0.5);
      this.coinIcon.setScale?.(0.65);
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
    if (this.money <= 0) {
      this.money = 0;
      this.outOfMoney?.();
    }
    this.updateText();
    this.showMoneyChange(-amount);
  }

  private showMoneyChange(amount: number): void {
    if (typeof this.scene.tweens?.add !== "function") return;

    const isGain = amount > 0;
    const sign = isGain ? "+" : "";
    const color = isGain ? "#067d1d" : "#d91616";

    const changeText = this.scene.add.text(
      this.config.textX + 10,
      this.config.textY + 35,
      `${sign}${amount}`,
      {
        fontSize: "24px",
        color,
        fontStyle: "bold",
      },
    );
    this.scene.cameras.main.ignore(changeText);

    this.scene.tweens.add({
      targets: changeText,
      y: this.config.textY + (isGain ? 20 : 55),
      alpha: 0,
      duration: 900,
      ease: "Cubic.easeOut",
      onComplete: () => changeText.destroy(),
    });
  }

  private updateCoinPosition(): void {
    this.coinIcon?.setX(this.moneyText.x + (this.moneyText.width ?? 75) + 8);
  }

  private updateText(): void {
    this.moneyText.setText(this.money.toString());
    this.updateCoinPosition();
  }
}

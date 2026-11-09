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

    if (typeof scene.add.image === "function") {
      this.coinIcon = scene.add
        .image(0, this.config.textY + 15, "coin")
        .setOrigin(0, 0.5)
        .setScale(0.65);
      this.updateCoinPosition();
      this.scene.cameras.main.ignore(this.coinIcon);
    }
  }

  getMoney(): void {
    this.money += this.config.gainAmount;
    this.updateText();
  }

  loseMoney(amount = this.config.defaultLoseAmount): void {
    this.money -= amount;
    if (this.money <= 0) {
      this.money = 0;
      this.outOfMoney?.();
    }
    this.updateText();
  }

  private updateCoinPosition(): void {
    this.coinIcon?.setX(this.moneyText.x + (this.moneyText.width ?? 75) + 8);
  }

  private updateText(): void {
    this.moneyText.setText(this.money.toString());
    this.updateCoinPosition();
  }
}

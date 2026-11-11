import Phaser from "phaser";
import BaseButtonContainer from "./basebuttoncontainer";
import { hintButtonUIConfig, type HintButtonUIConfig } from "../config";

export default class HintButton extends BaseButtonContainer {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: HintButtonUIConfig = hintButtonUIConfig,
  ) {
    super(
      scene,
      x,
      y,
      config.clickEvent,
      config.width,
      config.height,
      config.cornerRadius,
    );

    const background = scene.add.graphics();
    const drawBackground = (alpha: number) => {
      background.clear();
      background.fillStyle(config.backgroundColor, alpha);
      background.fillRoundedRect(
        -this.buttonWidth / 2,
        -this.buttonHeight / 2,
        this.buttonWidth,
        this.buttonHeight,
        this.cornerRadius,
      );
    };
    drawBackground(config.defaultAlpha);

    const border = scene.add.graphics();
    border.lineStyle(config.borderWidth, config.borderColor, config.borderAlpha);
    border.strokeRoundedRect(
      -this.buttonWidth / 2,
      -this.buttonHeight / 2,
      this.buttonWidth,
      this.buttonHeight,
      this.cornerRadius,
    );

    const text = scene.add
      .text(0, 0, config.label, {
        fontFamily: config.fontFamily,
        fontSize: config.fontSize,
        color: config.textColor,
      })
      .setOrigin(0, 0.5);

    const coin = scene.add
      .image(0, 0, config.coinTexture)
      .setOrigin(0, 0.5)
      .setScale(config.coinScale);

    const textWidth = text.width ?? config.fallbackTextWidth;
    const coinWidth = coin.displayWidth ?? config.fallbackCoinWidth;
    const totalWidth = textWidth + config.gap + coinWidth;
    const startX = -totalWidth / 2;

    text.setX(startX);
    coin.setX(startX + textWidth + config.gap);

    this.add([background, border, text, coin]);

    this.on("pointerover", () => {
      drawBackground(config.hoverAlpha);
    });

    this.on("pointerout", () => {
      drawBackground(config.defaultAlpha);
    });
  }
}
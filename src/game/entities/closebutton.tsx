import Phaser from "phaser";
import BaseButtonContainer from "./basebuttoncontainer";
import { closeButtonUIConfig, type CloseButtonUIConfig } from "../config";

export default class CloseButton extends BaseButtonContainer {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label = closeButtonUIConfig.defaultLabel,
    config: CloseButtonUIConfig = closeButtonUIConfig,
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
      .text(0, 0, label, {
        fontFamily: config.fontFamily,
        fontSize: config.fontSize,
        fontStyle: config.fontStyle,
        color: config.textColor,
      })
      .setOrigin(config.textOrigin);

    this.add([background, border, text]);

    this.on("pointerover", () => {
      drawBackground(config.hoverAlpha);
      text.setColor(config.hoverTextColor);
    });

    this.on("pointerout", () => {
      drawBackground(config.defaultAlpha);
      text.setColor(config.textColor);
    });
  }
}